# API Contract — Cancer HMS

The frontend (`/client`) currently runs against an in-browser mock API (`client/src/api/*.ts`, backed by `client/src/mocks/`). This document specifies the REST contract the real Spring Boot backend should implement so that swapping the mock functions for real `axios` calls requires no changes to any page/component — only to the internals of the files in `client/src/api/`.

All endpoints are prefixed with `/api`. All authenticated endpoints expect `Authorization: Bearer <token>`.

## Auth

- `POST /api/auth/login` — body `{ email, password }` → `{ token, user: User }`. 401 on bad credentials.
- `GET /api/auth/me` — → `User` for the current token. 401 if invalid/expired.
- `POST /api/auth/signup` — body `SignupInput` → `{ token, user: User }`. **No auth required** — this is
  the public account-creation endpoint. Always creates a `PATIENT` account (there is no role on the input)
  plus a new `Patient` record in the same transaction, linked via the returned user's `patientId`, so the
  account can book immediately. `Patient.diagnosisType` is set to a placeholder (`"Not yet assessed"`);
  staff completes clinical fields at the first real visit. 409 if `email` is already registered.

```ts
type Role = "ADMIN" | "DOCTOR" | "NURSE" | "RECEPTIONIST" | "PATIENT";
interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  patientId?: number;     // PATIENT accounts only: the Patient record this login owns
}
interface SignupInput {
  name: string;
  email: string;
  password: string;
  dob: string;            // ISO date
  sex: "Male" | "Female" | "Other";
  phone: string;
}
```

`PATIENT` accounts are patients signing in to the booking portal. Every endpoint below is annotated with
the roles allowed to call it — **`PATIENT` is not staff**, and silence is never permission.

## Users

- `GET /api/users?role=DOCTOR` — → `User[]`, optional role filter (used to populate doctor pickers).
  Allowed roles: `ADMIN`, `DOCTOR`, `NURSE`, `RECEPTIONIST`, `PATIENT`. When the caller is a `PATIENT`,
  only `role=DOCTOR` may be requested — a patient must not be able to enumerate staff or other patients.
- `POST /api/users` — body `StaffUserInput` → created `User`. Allowed roles: `ADMIN` only. **`role` must
  not be `PATIENT`** — patient accounts are created only via `POST /api/auth/signup`; enforce this
  server-side, not just by omitting a role picker in the UI. 409 if `email` is already registered.

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
