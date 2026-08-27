---
name: api-contract-sync
description: Rules keeping API_CONTRACT.md, client/src/types/index.js, client/src/api/*.js and client/src/mocks/ in sync. Load before editing any file in client/src/api or client/src/mocks, before changing client/src/types/index.js, before editing API_CONTRACT.md, and whenever adding or renaming an entity field, endpoint, or API function.
---

# API contract ↔ code sync

`API_CONTRACT.md` is the source of truth. A Java/Spring backend is being written against it by a
different developer, in a different repo. Drift here does not fail locally — it fails at merge time,
in someone else's codebase. Treat a contract edit as part of the change, not follow-up work.

## The hard rule

**No `api/*.js` exported signature change and no `types/index.js` field change without editing
`API_CONTRACT.md` in the same change.** That includes renames, casing changes, adding/removing an
optional marker, changing a return shape, and adding a new function. If you cannot justify the contract
edit, the code change is wrong.

Nothing here is type-checked — `client/` is plain JavaScript and the `@typedef` blocks are documentation
that editors and the audit tooling read. That makes this rule the *only* thing keeping the two sides
aligned; a compiler will not catch a rename for you.

## `client/src/api/*.js` module shape

Every module follows the same three parts, in this order:

```js
import { db, delay, nextId, persist } from "../mocks/db";   // 1. mock datastore

/** @typedef {Omit<import("../types").Patient, "id" | "registeredAt">} PatientInput */  // 2. Input shape

export async function listPatients() {                                                  // 3. async fns
  return delay([...db.patients].sort((a, b) => b.registeredAt.localeCompare(a.registeredAt)));
}
```

Entity types are referenced inline as `import("../types").Patient` inside a JSDoc comment — there is no
runtime import of `types/index.js` anywhere, and adding one would be dead weight in the bundle.

- Function names and signatures mirror the contract exactly: `listPatients()`, `createInvoice(input)`,
  `updateAppointmentStatus(id, status)`.
- **`*Input` / request / response shapes are documented in the api module, never in `types/index.js`.**
  They are `@typedef`s derived with `Omit<>` from the entity — `PatientInput`, `AppointmentInput`,
  `CreateInvoiceInput`, `InvoiceItemInput`, `BillingSummary`, `LoginResponse`, `SignupInput`,
  `ProfileInput`, `PasswordChangeInput`. They are documentation, not exports; nothing imports them.
- Every function returns `delay(...)` so loading states behave realistically.
- Not-found is signalled with this exact idiom:
  ```js
  return delay(undefined, 200).then(() => { throw new Error("Patient not found"); });
  ```
- Mutating functions call `persist()` after touching `db`, and take new ids from `nextId(kind)`.

## Sort order is part of the contract

- `listPatients` — newest registered first: `b.registeredAt.localeCompare(a.registeredAt)`
- `listAppointments` — `scheduledAt` **ascending**
- `listInvoices` — newest issued first

If you change a sort, change the contract line too.

## `client/src/types/index.js`

- A single flat file of `@typedef` blocks for **entities only**, ordered to match the section order of
  `API_CONTRACT.md`: `Role` → `User` → `DoctorEducation` → `DoctorProfile` → `Sex` → `Patient` →
  `AppointmentStatus` → `Appointment` → `InvoiceStatus` → `InvoiceItem` → `Invoice`.
- Each status/union alias is declared **immediately above** the typedef that uses it.
- The file has no runtime exports at all — it is imported only from inside JSDoc comments, as
  `import("../types").Patient`.
- All ids are `number`; all dates are ISO `string`; optional fields are written
  `@property {number} [assignedDoctorId]`, matching the contract's `?`.
- Known intentional divergence: the contract inlines `"Male" | "Female" | "Other"` while the frontend
  names it `Sex`. That is fine — the *wire values* match, which is what counts.

## `client/src/mocks/`

- `db.js` hydrates from `localStorage["cancer-hms-mock-db-v1"]`, falling back to `seedData.js`; exports
  `db`, `persist()`, `resetMockDb()`, `nextId(kind)`, `delay(value, ms = 350)`.
- `seedData.js` defines a `MockUser` typedef — `User` plus `password`, the only place a password exists.
- Adding an entity means adding a seed array, a `db` field, and a `nextId` kind.
- Nothing outside `client/src/api/` may import from `mocks/`.

## Known open gaps (do not "fix" silently — they are real decisions)

- `getPatient` and `getInvoice` resolve to `undefined` when the id is unknown, while the contract
  specifies **404**. This is a swap point: when wiring the real API, decide whether to keep `undefined`
  or throw.
- `listAppointments()` and `listInvoices()` take **no `patientId` parameter**, even though the contract
  documents `GET /api/appointments?patientId=` and `GET /api/invoices?patientId=` as optional filters.
  Both mock functions always return every row; every page that needs "just this patient's" filters
  client-side after the fetch (`MyBookingsPage`, `PatientDetailPage`, `MyBillsPage`, ...). This is a
  deliberate mock simplification, not drift to fix — but it also means the mock enforces **none** of the
  PATIENT-scoping language in either contract entry ("scoped to their own ... regardless of the parameter
  ... the filter is a convenience, never the check"); that check exists only server-side, in the real
  backend, same as the DOCTOR clinical-field restriction below.
- Role annotations are now on every endpoint except the three that precede a session
  (`POST /api/auth/login`, `POST /api/auth/signup`, `GET /api/auth/me`), where they would mean nothing.
  Silence elsewhere is a bug, not a permission.
- `PATCH /api/auth/me` and `POST /api/auth/me/password` take **no user id** — the account comes from the
  token. If you ever find yourself adding an id parameter to `updateProfile` or `changePassword` in
  `api/auth.js`, that is the contract being broken, not extended.

## At merge time

Only the **internals** of `client/src/api/*.js` change (mock logic → `axios` against `/api/...`).
No page or component changes; `client/src/mocks/` is then deleted. `axios` is already a dependency and
is currently imported nowhere — it is reserved for exactly this. See the `/wire-api` command.
