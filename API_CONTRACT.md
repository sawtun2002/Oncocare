# API Contract — OncoCare

The frontend (`/client`) currently runs against an in-browser mock API (`client/src/api/*.js`, backed by `client/src/mocks/`). This document specifies the REST contract the real Spring Boot backend should implement so that swapping the mock functions for real `axios` calls requires no changes to any page/component — only to the internals of the files in `client/src/api/`.

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
- `POST /api/auth/me/notifications/read` — no body → updated `User`. Allowed roles: all, own account
  only. Stamps `notificationsReadAt` to now; that is the whole of the notice bell's stored state (see
  **Notices** below). Distinct from `PATCH /api/auth/me/notifications`, which is the email-reminder
  *preference*.

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
  notificationsReadAt?: string;  // ISO datetime; see Notices. Unset = nothing read yet.
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

### Password policy

Every field that sets a password — `SignupInput.password`, `PasswordChangeInput.newPassword`,
`StaffUserInput.password` — must satisfy **all** of:

- at least 8 characters;
- contains a lowercase letter, an uppercase letter, a digit, and a non-alphanumeric character;
- at least 5 distinct characters (rejects `aaaaaaaa`, `abababab`);
- no single character three or more times in a row (`aaa`);
- not one of a small server-maintained list of common passwords.

The frontend enforces exactly this in `client/src/lib/validation.js` (`evaluatePassword`) as a UX guard —
live strength meter on the signup and change-password forms — but it is bypassable, so the backend must
re-check the same rules and return **400** with a message naming the first unmet rule. Keep the two
definitions in step: a change to the policy is a change to that file *and* to this list.

### Notices

The in-app notice bell shows an account the appointment activity it should know about. **Nothing is
stored per notice.** Each `AppointmentEvent` already records who acted (`byUserId`/`byRole`), so a
notice is simply an event on an appointment the viewer is a party to, that the viewer did not cause
themselves. The backend derives the list on demand; the only persisted state is
`User.notificationsReadAt`, and "unread" is `event.at > notificationsReadAt` (everything, if unset).

Audience by role — the frontend computes exactly this in `client/src/lib/notices.js`, and the backend
must match it:

| Viewer | Appointments in scope | Event types | Extra rule |
|---|---|---|---|
| `PATIENT` | their own (`patientId`) | `ACCEPTED`, `DECLINED`, `RESCHEDULED`, `CANCELLED` | not events they caused |
| `DOCTOR` | their own (`doctorId`) | `REQUESTED`, `RESCHEDULED`, `CANCELLED` | not events they caused |
| `RECEPTIONIST` | all | `REQUESTED`, `RESCHEDULED`, `CANCELLED` | **only `byRole === "PATIENT"`** events (D6) — so they can triage requests and re-fill freed slots |
| `ADMIN` | — (no appointment notices) | — | one notice per **`PENDING` `LeaveRequest` not their own** (D6); `at` for sort/unread is `requestedAt` |
| `NURSE` | — | — | nothing |

A system event (an expired request: `byUserId`/`byRole` null) always counts as a notice for its
appointment's patient and doctor.

Every notice — appointment or leave — carries a common `{ at }` timestamp; the unread count is
`at > notificationsReadAt` across both kinds.

`GET /api/notifications` is **optional** for the backend: the v1 client derives notices from the
`GET /api/appointments` result it already holds. A server-side endpoint returning the same derived list
may be added later without any client change beyond swapping the source. Allowed roles when it does
exist: `ADMIN`, `DOCTOR`, `NURSE`, `RECEPTIONIST`, `PATIENT` — each scoped server-side to their own
derived notices per the table above, never a `userId` parameter.

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
- `PATCH /api/patients/:id` — body `Partial<PatientInput>` → updated `Patient`. Allowed roles: `ADMIN`, `RECEPTIONIST` (any field), `DOCTOR` (limited to the clinical fields — `diagnosisType`, `diagnosisStage`, `bloodType`, `allergies`, `medicalHistory`, `notes` — on their assigned patients; **never** `emergencyContactName`/`emergencyContactPhone`, which are registrar territory like `phone`/`address` — enforce server-side).

```ts
type BloodType = "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
interface Patient {
  id: number;
  name: string;
  dob: string;            // ISO date
  sex: "Male" | "Female" | "Other";
  phone: string;
  address?: string;
  emergencyContactName?: string;   // registrar field, not DOCTOR-editable -- see above
  emergencyContactPhone?: string;  // registrar field, not DOCTOR-editable -- see above
  diagnosisType: string;
  diagnosisStage?: string;
  bloodType?: BloodType;
  allergies?: string;      // free text
  medicalHistory?: string; // free text -- past conditions, surgeries, relevant family history
  notes?: string;
  assignedDoctorId?: number;
  registeredAt: string;   // ISO datetime
}
type PatientInput = Omit<Patient, "id" | "registeredAt">;
```

## Appointments

An appointment is a small state machine, not a free `status` field. Who creates it decides where it
starts: a `PATIENT` booking lands in `REQUESTED` and waits for the doctor; a staff booking skips
straight to `SCHEDULED`. `DECLINED` and `CANCELLED` are terminal — there is no transition out of them,
you create a new appointment instead. Every transition **appends an `AppointmentEvent`** to `events`;
the server sets `byUserId`/`byRole` from the token, never from the body.

**A slot is blocked** by an appointment whose status is `SCHEDULED`, or `REQUESTED` and not past its
`expiresAt`. `DECLINED`, `CANCELLED`, `NO_SHOW`, `COMPLETED` and expired `REQUESTED` free it.

**Request expiry:** on `POST` by a `PATIENT`, the server sets `expiresAt` to the sooner of 48h from now
and the slot start. A `GET` (or a scheduled sweep) that finds a `REQUESTED` appointment past `expiresAt`
transitions it to `DECLINED` with a system event (`byUserId`/`byRole` null,
`reason: "No response — the request expired"`).

- `GET /api/appointments?patientId=` — → `Appointment[]`, sorted by `scheduledAt` ascending. `patientId`
  is an optional filter. Allowed roles: all. **A `PATIENT` caller is scoped to their own appointments
  server-side regardless of the `patientId` parameter** — the filter is a convenience, never the check.
- `GET /api/appointments/availability?doctorId=&date=` — → `TimeSlot[]` for one doctor on one day.
  `date` is a local calendar date (`YYYY-MM-DD`) in clinic time. Slots are every 30 minutes from 09:00 up
  to (not including) 17:00. `available` is `false` when the doctor already has a **slot-blocking**
  appointment (see above) overlapping that slot, or when the slot is in the past. Allowed roles: all.
- `POST /api/appointments` — body `AppointmentInput` → created `Appointment`. **The status is derived
  from the caller's role, never read from the body:** `PATIENT` → `REQUESTED` (+ `expiresAt`), any staff
  role → `SCHEDULED`. Appends the first event (`REQUESTED` or `ACCEPTED`). **409 if the time overlaps a
  slot-blocking appointment for that doctor.** Allowed roles: `ADMIN`, `DOCTOR`, `NURSE`, `RECEPTIONIST`
  for any patient; `PATIENT` only when `patientId` equals their own — enforce server-side.
- `POST /api/appointments/:id/accept` — no body → updated `Appointment` (`REQUESTED` → `SCHEDULED`).
  Re-checks the overlap rule — 409 if the slot filled while the request sat. Appends an `ACCEPTED` event.
  Allowed roles: `ADMIN`, `RECEPTIONIST`, and the `DOCTOR` the request is for (**not** a doctor accepting
  their own self-made request, **not** `NURSE`) — enforce server-side. 409 if the appointment is not
  `REQUESTED`.
- `POST /api/appointments/:id/decline` — body `{ reason: string }` (**required, non-empty**) → updated
  `Appointment` (`REQUESTED` → `DECLINED`). Appends a `DECLINED` event carrying the reason; frees the
  slot. Allowed roles: same as `accept`. 409 if the appointment is not `REQUESTED`.
- `PATCH /api/appointments/:id` — body `Partial<AppointmentInput> & { reason?: string }` → updated
  `Appointment`. Reschedule only (time and/or doctor); the status does not change and only `REQUESTED`
  or `SCHEDULED` may be moved. `reason` is **required when the caller is acting on an appointment that is
  not their own** (any staff moving a patient's booking; ignored for a `PATIENT` moving their own).
  Appends a `RESCHEDULED` event with `fromScheduledAt`/`toScheduledAt`. **409 on the overlap rule**,
  ignoring the appointment being moved. Allowed roles: `ADMIN`, `DOCTOR`, `NURSE`, `RECEPTIONIST`;
  `PATIENT` only on their own.
- `PATCH /api/appointments/:id/status` — body `{ status: AppointmentStatus }` → updated `Appointment`.
  Serves only `SCHEDULED` → `COMPLETED` or `NO_SHOW`, and only once the slot start is in the past.
  Appends the matching event. Allowed roles: `ADMIN`, `DOCTOR`, `NURSE`, `RECEPTIONIST`. 409 for any
  other transition.
- `POST /api/appointments/:id/cancel` — body `{ reason?: string }` → updated `Appointment`
  (`REQUESTED` or `SCHEDULED` → `CANCELLED`, terminal). `reason` is **required when acting on an
  appointment that is not the caller's own** (any staff cancelling a patient's booking); optional for a
  `PATIENT` cancelling their own. The `CANCELLED` event sets `lateNotice: true` when the cancellation
  lands under 24h before the slot — a flag the history keeps, not a block. Allowed roles: `ADMIN`,
  `DOCTOR`, `NURSE`, `RECEPTIONIST`; `PATIENT` only on their own. 409 if the appointment is already
  terminal.

```ts
type AppointmentStatus =
  | "REQUESTED"    // patient booking, awaiting the doctor. Staff bookings skip this.
  | "SCHEDULED"
  | "COMPLETED"
  | "CANCELLED"    // terminal
  | "NO_SHOW"
  | "DECLINED";    // terminal -- doctor turned the request down, or it expired

type AppointmentEventType =
  | "REQUESTED" | "ACCEPTED" | "DECLINED" | "RESCHEDULED" | "CANCELLED" | "COMPLETED" | "NO_SHOW";

interface AppointmentEvent {
  type: AppointmentEventType;
  byUserId: number | null;      // null for a system event (an expired request)
  byRole: Role | null;
  at: string;                   // ISO datetime
  reason?: string;              // required on DECLINED, and on a CANCELLED/RESCHEDULED of someone else's
  fromScheduledAt?: string;     // RESCHEDULED only
  toScheduledAt?: string;       // RESCHEDULED only
  lateNotice?: boolean;         // CANCELLED only: cancelled <24h before the slot
}

interface Appointment {
  id: number;
  tokenNumber?: string;   // unique digital check-in token (e.g. TK-2026-0841)
  patientId: number;
  doctorId: number;
  scheduledAt: string;    // ISO datetime
  durationMinutes: number;
  status: AppointmentStatus;
  reason?: string;        // reason for the visit -- set at booking, distinct from an event reason
  events: AppointmentEvent[];   // oldest first, never empty
  expiresAt?: string;     // REQUESTED only
}
type AppointmentInput = Omit<Appointment, "id" | "status" | "events" | "expiresAt">;

interface TimeSlot {
  start: string;          // ISO datetime
  available: boolean;
}
```

**NURSE, explicitly:** a nurse may create a booking (→ `SCHEDULED`), reschedule one, and mark a past
appointment `COMPLETED`/`NO_SHOW`. A nurse may **not** accept or decline a request — committing a
doctor's time to a new patient is not a nursing decision.

## Billing

Managing billing (creating invoices, changing their status, the revenue summary) is staff-only.
**Reading your own bill is not** — a `PATIENT` may list their own invoices read-only, the same shape of
exception `GET /api/appointments` already makes.

- `GET /api/invoices?patientId=` — → `Invoice[]`, newest issued first. `patientId` is an optional filter.
  Allowed roles: `ADMIN`, `RECEPTIONIST` for any patient; `PATIENT` **read-only**, scoped to their own
  invoices server-side regardless of the `patientId` parameter — the filter is a convenience, never the
  check, same as the equivalent appointments rule.
- `GET /api/invoices/:id` — → `Invoice`. Allowed roles: `ADMIN`, `RECEPTIONIST`.
- `POST /api/invoices` — body `{ patientId, items: InvoiceItemInput[] }` → created `Invoice` (`status` defaults to `UNPAID`, `issuedAt` set server-side). Allowed roles: `ADMIN`, `RECEPTIONIST`.
- `PATCH /api/invoices/:id/status` — body `{ status: InvoiceStatus }` → updated `Invoice`. Allowed roles: `ADMIN`, `RECEPTIONIST`.
- `POST /api/invoices/:id/payment-proof` — body `{ amount, note, receiptDataUrl }` → updated `Invoice` with a pending `paymentSubmission`. Allowed roles: `PATIENT` for their own invoice only; staff verifies the proof and changes invoice status separately.
- `GET /api/billing/summary` — → `{ totalRevenue: number; outstanding: number; invoiceCount: number }`. `totalRevenue` sums `PAID` invoices; `outstanding` sums non-`PAID` invoices. Allowed roles: `ADMIN`, `RECEPTIONIST`. **Not** `PATIENT` — this is the clinic-wide total, not theirs; a patient's own outstanding/paid totals are computed client-side from their own `GET /api/invoices` result on `/my-bills`.

```ts
type InvoiceStatus = "UNPAID" | "PARTIAL" | "PAID";
type PaymentProofStatus = "PENDING" | "REJECTED";
type InvoiceItemInput = Omit<InvoiceItem, "id">;
interface InvoiceItem { id: number; description: string; quantity: number; unitPrice: number; }
interface PaymentProof { amount: number; note: string; receiptDataUrl: string; submittedAt: string; status: PaymentProofStatus; }
interface Invoice {
  id: number;
  patientId: number;
  issuedAt: string;       // ISO datetime
  status: InvoiceStatus;
  items: InvoiceItem[];
  paymentSubmission?: PaymentProof;
}
```

## Leave

Staff time off. Any of the four staff roles may file a request for themselves and withdraw it while it
is still `PENDING`; **only an `ADMIN` decides one, and never their own** — the same self-exclusion as
staff deactivation. `PATIENT` has no access here at all. `startDate`/`endDate` are inclusive calendar
dates (`YYYY-MM-DD`), not datetimes — half-days are out of scope. `userId` and `decidedByUserId` are set
from the caller's token, never the body.

- `GET /api/leave-requests?userId=&status=` — → `LeaveRequest[]`, newest `requestedAt` first. Both query
  params are optional filters. Allowed roles: `ADMIN` sees all; `DOCTOR`, `NURSE`, `RECEPTIONIST` are
  **scoped server-side to their own** regardless of the `userId` param — the filter is a convenience,
  never the check.
- `POST /api/leave-requests` — body `LeaveRequestInput` → created `LeaveRequest` (`status` `PENDING`,
  `requestedAt` and `userId` set server-side). 400 if `endDate` is before `startDate`. Allowed roles:
  `ADMIN`, `DOCTOR`, `NURSE`, `RECEPTIONIST` — for themselves only.
- `PATCH /api/leave-requests/:id/decision` — body `{ status: "APPROVED" | "DECLINED", note?: string }` →
  updated `LeaveRequest` (`decidedByUserId`/`decidedAt` set server-side). `note` is **required when
  `status` is `DECLINED`**. 409 if the request is not `PENDING`. Allowed roles: `ADMIN` only, **and not
  on a request where `userId` is the caller** — enforce server-side.
- `POST /api/leave-requests/:id/withdraw` — no body → updated `LeaveRequest` (`PENDING` → `WITHDRAWN`).
  409 if not `PENDING`. Allowed roles: `ADMIN`, `DOCTOR`, `NURSE`, `RECEPTIONIST` — **only on their own
  request**.

```ts
type LeaveType = "ANNUAL" | "SICK" | "TRAINING" | "OTHER";
type LeaveStatus = "PENDING" | "APPROVED" | "DECLINED" | "WITHDRAWN";  // APPROVED/DECLINED terminal
interface LeaveRequest {
  id: number;
  userId: number;         // the staff account the leave is for
  type: LeaveType;
  startDate: string;      // inclusive, YYYY-MM-DD
  endDate: string;        // inclusive, YYYY-MM-DD, not before startDate
  reason: string;
  status: LeaveStatus;
  requestedAt: string;    // ISO datetime
  decidedByUserId?: number;
  decidedAt?: string;     // ISO datetime
  decisionNote?: string;  // required on DECLINED, optional on APPROVED
}
type LeaveRequestInput = Pick<LeaveRequest, "type" | "startDate" | "endDate" | "reason">;
```

Phase 4 will add `GET /api/leave-requests/:id/conflicts` (the appointments an approval would collide
with) and have `GET /api/appointments/availability` return no slots on an approved-leave day. Neither
exists yet.

## Equipment Posts

Hospital equipment and medical technology showcase posts. Any user (including patients and unauthenticated visitors) can read equipment posts. **Only an `ADMIN` can create, update, or delete equipment posts.**

- `GET /api/equipment?category=&active=&featured=` — → `EquipmentPost[]`. Query parameters are optional filters. Returns active equipment by default for public/patient callers; Admins see all equipment posts.
- `GET /api/equipment/:id` — → `EquipmentPost`. Returns a single equipment item by ID. 404 if not found.
- `POST /api/equipment` — body `EquipmentPostInput` → created `EquipmentPost`. Allowed roles: `ADMIN` only.
- `PUT /api/equipment/:id` — body `EquipmentPostInput` → updated `EquipmentPost`. Allowed roles: `ADMIN` only.
- `DELETE /api/equipment/:id` — → `204 No Content`. Allowed roles: `ADMIN` only.

```ts
interface EquipmentPost {
  id: number;
  title: string;
  description?: string;
  category: string;
  manufacturer?: string;
  model?: string;
  imageUrl?: string;
  isFeatured: boolean;
  isActive: boolean;
  createdBy: number;       // User ID of the admin creator
  createdAt: string;       // ISO datetime
  updatedAt: string;       // ISO datetime
}
type EquipmentPostInput = Omit<EquipmentPost, "id" | "createdBy" | "createdAt" | "updatedAt">;
```

## Notes for the merge

- Field names/casing above are the source of truth the frontend was built against — matching them exactly avoids any frontend changes.
- Error responses: the frontend expects a JSON body with an `error` message string on 4xx/5xx (`{ error: "..." }`) and surfaces it directly in forms.
- Once the Spring Boot API is live, only `client/src/api/*.js` need to change (replace mock-data calls with `axios` calls against `/api/...`); `client/src/mocks/` can then be deleted.
- **Known gap, decide when wiring the real API:** an `INACTIVE` doctor is only kept out of new
  bookings/assignments by the frontend filtering them from `SlotPicker`'s and `PatientFormDialog`'s
  doctor pickers — the mock's `POST/PATCH /api/appointments` and `PATCH /api/patients/:id` accept a
  `doctorId`/`assignedDoctorId` pointing at a deactivated doctor without complaint. A real backend should
  almost certainly reject that server-side (409, same spirit as the overlap check) rather than rely on
  the picker alone, since nothing stops a direct API call bypassing it.
