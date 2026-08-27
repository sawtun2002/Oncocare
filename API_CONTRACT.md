# API Contract — OncoCare

The frontend (`/client`) currently runs against an in-browser mock API (`client/src/api/*.ts`, backed by `client/src/mocks/`). This document specifies the REST contract the real Spring Boot backend should implement so that swapping the mock functions for real `axios` calls requires no changes to any page/component — only to the internals of the files in `client/src/api/`.

All endpoints are prefixed with `/api`. All authenticated endpoints expect `Authorization: Bearer <token>`.

## Auth

- `POST /api/auth/login` — body `{ email, password }` → `{ token, user: User }`. 401 on bad credentials,
  and 401 (with a distinct message, e.g. "This account has been deactivated") if the credentials are
  correct but `user.status` is `INACTIVE` — checked only *after* the credentials already match, so a
  wrong-password guess and a deactivated account are never distinguishable from each other. On success,
  sets `User.lastLoginAt` to now.
- `GET /api/auth/me` — → `User` for the current token. 401 if invalid/expired.
- `POST /api/auth/signup` — body `SignupInput` → `{ token, user: User }`. **No auth required** — this is
  the public account-creation endpoint. Always creates a `PATIENT` account (there is no role on the input)
  plus a new `Patient` record in the same transaction, linked via the returned user's `patientId`, so the
  account can book immediately. `Patient.diagnosisType` is set to a placeholder (`"Not yet assessed"`);
  staff completes clinical fields at the first real visit. 409 if `email` is already registered.
- `PATCH /api/auth/me` — body `ProfileInput` → updated `User`. Allowed roles: all, **own account only**.
  The account to update is taken from the token; there is deliberately no id in the path or body, so
  there is nothing for a caller to substitute. **`role` and `patientId` must not be updatable here** —
  an account that could raise its own role would make every other role check decorative. 409 if `email`
  already belongs to a different account.
- `POST /api/auth/me/password` — body `PasswordChangeInput` → `204 No Content`. Allowed roles: all, own
  account only. 400 if `currentPassword` does not match; requiring it is what stops an unattended,
  still-signed-in screen being enough to take the account over. The token stays valid — this is not a
  re-login and no new token is issued.
- `PATCH /api/auth/me/avatar` — body `{ avatarUrl?: string }` → updated `User`. Allowed roles: all, own
  account only. Omitting `avatarUrl` (or sending it as `undefined`/`null`) removes the photo. The mock
  sends a `data:` URI directly; a real backend would more plausibly want a signed-upload flow that
  returns a plain URL to store instead — treat this endpoint's request shape as a swap point, the same
  as the `getPatient`/`getInvoice` 404-vs-`undefined` one below.
- `PATCH /api/auth/me/notifications` — body `NotificationPreferencesInput` → updated `User`. Allowed
  roles: all, own account only. Mock-only for now — there is no real email backend to act on the
  preference yet, so the backend only needs to persist and return it.

```ts
type Role = "ADMIN" | "DOCTOR" | "NURSE" | "RECEPTIONIST" | "PATIENT";
type UserStatus = "ACTIVE" | "INACTIVE";
interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  patientId?: number;     // PATIENT accounts only: the Patient record this login owns
  status: UserStatus;     // defaults ACTIVE; see PATCH /api/users/:id/status
  avatarUrl?: string;
  phone?: string;         // staff accounts only -- see the note below ProfileInput
  department?: string;    // staff accounts only, free text (e.g. "Oncology Ward 3")
  notifyAppointmentReminders: boolean;  // defaults true; mock-only preference
  lastLoginAt?: string;   // ISO datetime, set by POST /api/auth/login
}
interface SignupInput {
  name: string;
  email: string;
  password: string;
  dob: string;            // ISO date
  sex: "Male" | "Female" | "Other";
  phone: string;
}
interface ProfileInput {
  name: string;
  email: string;
  phone?: string;         // staff accounts only -- omit for a PATIENT caller
  department?: string;    // staff accounts only -- omit for a PATIENT caller
}
interface PasswordChangeInput {
  currentPassword: string;
  newPassword: string;
}
interface NotificationPreferencesInput {
  notifyAppointmentReminders: boolean;
}
```

`ProfileInput` covers name/email for everyone and phone/department for staff only. A patient's phone and
address live on their `Patient` record, not on their login, and are edited through
`PATCH /api/patients/:id` by staff — the two must not both be writable from the profile screen or they
will disagree. Photo (`PATCH /api/auth/me/avatar`) and the reminders toggle
(`PATCH /api/auth/me/notifications`) are deliberately separate endpoints rather than more `ProfileInput`
fields: each is meant to save the instant it changes in the UI, not wait on this endpoint's own submit.

`PATIENT` accounts are patients signing in to the booking portal. Every endpoint below is annotated with
the roles allowed to call it — **`PATIENT` is not staff**, and silence is never permission.

## Users

- `GET /api/users?role=DOCTOR` — → `User[]`, optional role filter (used to populate doctor pickers).
  Allowed roles: `ADMIN`, `DOCTOR`, `NURSE`, `RECEPTIONIST`, `PATIENT`. When the caller is a `PATIENT`,
  only `role=DOCTOR` may be requested — a patient must not be able to enumerate staff or other patients.
- `POST /api/users` — body `StaffUserInput` → created `User` (`status` defaults to `ACTIVE`). Allowed
  roles: `ADMIN` only. **`role` must not be `PATIENT`** — patient accounts are created only via
  `POST /api/auth/signup`; enforce this server-side, not just by omitting a role picker in the UI. 409 if
  `email` is already registered.
- `PATCH /api/users/:id/status` — body `{ status: UserStatus }` → updated `User`. Allowed roles: `ADMIN`
  only, and **not on the caller's own account** — enforce server-side; deactivating your own last-admin
  account by accident would lock everyone out with no one left able to undo it. Deactivating a staff
  account only blocks that login (see `POST /api/auth/login`) and drops it out of the frontend's doctor
  pickers for *new* appointments/assignments — it does **not** touch the `User` record otherwise, or
  anything that already references it (a doctor's assigned `Patient`s, past or future `Appointment`s).
  That's the reason this is a status flip rather than `DELETE /api/users/:id`, which does not exist.

```ts
type StaffRole = Exclude<Role, "PATIENT">;
interface StaffUserInput {
  name: string;
  email: string;
  password: string;
  role: StaffRole;
}
```

## Doctors

The patient-facing doctor directory. Kept separate from `GET /api/users?role=DOCTOR` on purpose: that
one returns **account** records and is staff-oriented, this one returns **profile/CV** information and is
the only doctor data a `PATIENT` may read. Never include account or credential fields here.

- `GET /api/doctors` — → `DoctorProfile[]`, sorted by `name` ascending. Allowed roles: `ADMIN`, `DOCTOR`,
  `NURSE`, `RECEPTIONIST`, `PATIENT`.
- `GET /api/doctors/:id` — → `DoctorProfile`. 404 if the id is not a doctor with a profile. Allowed
  roles: `ADMIN`, `DOCTOR`, `NURSE`, `RECEPTIONIST`, `PATIENT`.

```ts
interface DoctorEducation {
  degree: string;
  institution: string;
  year: number;                    // graduation / completion year
}
interface DoctorProfile {
  id: number;                      // the doctor's User id
  name: string;                    // duplicated from User so the profile is self-contained
  specialty: string;
  yearsOfExperience: number;
  education: DoctorEducation[];    // newest first
  certifications?: string[];
  languages?: string[];
  bio?: string;
  acceptingNewPatients: boolean;
}
```

There is no write endpoint for profiles yet — they are read-only in the frontend. If profile editing is
added later it belongs to `ADMIN` (any profile) and `DOCTOR` (their own).

## Patients

- `GET /api/patients` — → `Patient[]`, newest registered first. Allowed roles: `ADMIN`, `DOCTOR`,
  `NURSE`, `RECEPTIONIST`. **Never `PATIENT`** — this is the full patient register.
- `GET /api/patients/:id` — → `Patient`. 404 if missing. Allowed roles: `ADMIN`, `DOCTOR`, `NURSE`,
  `RECEPTIONIST`; a `PATIENT` may read only their own record (`id === their own patientId`).
- `POST /api/patients` — body `PatientInput` → created `Patient`. Allowed roles: `ADMIN`, `RECEPTIONIST`.
- `PATCH /api/patients/:id` — body `Partial<PatientInput>` → updated `Patient`. Allowed roles: `ADMIN`, `RECEPTIONIST` (any field), `DOCTOR` (limited to `diagnosisType`, `diagnosisStage`, `notes` on their assigned patients — enforce server-side).

```ts
interface Patient {
  id: number;
  name: string;
  dob: string;            // ISO date
  sex: "Male" | "Female" | "Other";
  phone: string;
  address?: string;
  diagnosisType: string;
  diagnosisStage?: string;
  notes?: string;
  assignedDoctorId?: number;
  registeredAt: string;   // ISO datetime
}
type PatientInput = Omit<Patient, "id" | "registeredAt">;
```

## Appointments

- `GET /api/appointments?patientId=` — → `Appointment[]`, sorted by `scheduledAt` ascending. `patientId`
  is an optional filter. Allowed roles: all. **A `PATIENT` caller is scoped to their own appointments
  server-side regardless of the `patientId` parameter** — the filter is a convenience, never the check.
- `GET /api/appointments/availability?doctorId=&date=` — → `TimeSlot[]` for one doctor on one day.
  `date` is a local calendar date (`YYYY-MM-DD`) in clinic time. Slots are every 30 minutes from 09:00 up
  to (not including) 17:00. `available` is `false` when the doctor already has a non-`CANCELLED`
  appointment **overlapping** that slot, or when the slot is in the past. Allowed roles: all.
- `POST /api/appointments` — body `AppointmentInput` → created `Appointment` (`status` defaults to
  `SCHEDULED`). **409 if the requested time overlaps an existing non-`CANCELLED` appointment for that
  doctor.** Allowed roles: `ADMIN`, `DOCTOR`, `NURSE`, `RECEPTIONIST` for any patient; `PATIENT` only when
  `patientId` equals their own — enforce server-side, never trust the body.
- `PATCH /api/appointments/:id` — body `Partial<AppointmentInput>` → updated `Appointment`. Used to
  reschedule. **409 on the same overlap rule**, ignoring the appointment being moved. Allowed roles:
  `ADMIN`, `DOCTOR`, `NURSE`, `RECEPTIONIST`; `PATIENT` only on their own appointment.
- `PATCH /api/appointments/:id/status` — body `{ status: AppointmentStatus }` → updated `Appointment`.
  Allowed roles: `ADMIN`, `DOCTOR`, `NURSE`, `RECEPTIONIST` for any status; a `PATIENT` may set only
  `CANCELLED`, and only on their own appointment. Moving a booking **out** of `CANCELLED` re-checks the
  overlap rule (the slot was released on cancellation and may since have been taken) — 409 if it clashes.

```ts
type AppointmentStatus = "SCHEDULED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
interface Appointment {
  id: number;
  patientId: number;
  doctorId: number;
  scheduledAt: string;    // ISO datetime
  durationMinutes: number;
  status: AppointmentStatus;
  reason?: string;
}
type AppointmentInput = Omit<Appointment, "id" | "status">;

interface TimeSlot {
  start: string;          // ISO datetime
  available: boolean;
}
```

## Billing

Billing is staff-only in its entirety. These four endpoints previously carried no role annotation, which
was tolerable while every account was a staff account and is not once patients can sign in.

- `GET /api/invoices` — → `Invoice[]`, newest issued first. Allowed roles: `ADMIN`, `RECEPTIONIST`.
- `GET /api/invoices/:id` — → `Invoice`. Allowed roles: `ADMIN`, `RECEPTIONIST`.
- `POST /api/invoices` — body `{ patientId, items: InvoiceItemInput[] }` → created `Invoice` (`status` defaults to `UNPAID`, `issuedAt` set server-side). Allowed roles: `ADMIN`, `RECEPTIONIST`.
- `PATCH /api/invoices/:id/status` — body `{ status: InvoiceStatus }` → updated `Invoice`. Allowed roles: `ADMIN`, `RECEPTIONIST`.
- `GET /api/billing/summary` — → `{ totalRevenue: number; outstanding: number; invoiceCount: number }`. `totalRevenue` sums `PAID` invoices; `outstanding` sums non-`PAID` invoices. Allowed roles: `ADMIN`, `RECEPTIONIST`.

```ts
type InvoiceStatus = "UNPAID" | "PARTIAL" | "PAID";
interface InvoiceItem { id: number; description: string; quantity: number; unitPrice: number; }
interface Invoice {
  id: number;
  patientId: number;
  issuedAt: string;       // ISO datetime
  status: InvoiceStatus;
  items: InvoiceItem[];
}
```

## Notes for the merge

- Field names/casing above are the source of truth the frontend was built against — matching them exactly avoids any frontend changes.
- Error responses: the frontend expects a JSON body with an `error` message string on 4xx/5xx (`{ error: "..." }`) and surfaces it directly in forms.
- Once the Spring Boot API is live, only `client/src/api/*.ts` need to change (replace mock-data calls with `axios` calls against `/api/...`); `client/src/mocks/` can then be deleted.
- **Known gap, decide when wiring the real API:** an `INACTIVE` doctor is only kept out of new
  bookings/assignments by the frontend filtering them from `SlotPicker`'s and `PatientFormDialog`'s
  doctor pickers — the mock's `POST/PATCH /api/appointments` and `PATCH /api/patients/:id` accept a
  `doctorId`/`assignedDoctorId` pointing at a deactivated doctor without complaint. A real backend should
  almost certainly reject that server-side (409, same spirit as the overlap check) rather than rely on
  the picker alone, since nothing stops a direct API call bypassing it.
