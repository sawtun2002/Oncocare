---
name: api-contract-sync
description: Rules keeping API_CONTRACT.md, client/src/types/index.ts, client/src/api/*.ts and client/src/mocks/ in sync. Load before editing any file in client/src/api or client/src/mocks, before changing client/src/types/index.ts, before editing API_CONTRACT.md, and whenever adding or renaming an entity field, endpoint, or API function.
---

# API contract ↔ code sync

`API_CONTRACT.md` is the source of truth. A Java/Spring backend is being written against it by a
different developer, in a different repo. Drift here does not fail locally — it fails at merge time,
in someone else's codebase. Treat a contract edit as part of the change, not follow-up work.

## The hard rule

**No `api/*.ts` exported signature change and no `types/index.ts` field change without editing
`API_CONTRACT.md` in the same change.** That includes renames, casing changes, adding/removing `?`,
changing a return type, and adding a new function. If you cannot justify the contract edit, the code
change is wrong.

## `client/src/api/*.ts` module shape

Every module follows the same four parts, in this order:

```ts
import { db, delay, nextId, persist } from "../mocks/db";   // 1. mock datastore
import type { Patient } from "../types";                    // 2. entity types

export type PatientInput = Omit<Patient, "id" | "registeredAt">;  // 3. Input alias

export async function listPatients(): Promise<Patient[]> {         // 4. async fns
  return delay([...db.patients].sort((a, b) => b.registeredAt.localeCompare(a.registeredAt)));
}
```

- Function names and signatures mirror the contract exactly: `listPatients()`, `createInvoice(input)`,
  `updateAppointmentStatus(id, status)`.
- **`*Input` / request / response types live in the api module, never in `types/index.ts`.** They are
  derived with `Omit<>` from the entity and exported from the api file
  (`PatientInput`, `AppointmentInput`, `CreateInvoiceInput`, `InvoiceItemInput`, `BillingSummary`, `LoginResponse`).
- Every function returns `delay(...)` so loading states behave realistically.
- Not-found is signalled with this exact idiom:
  ```ts
  return delay(undefined, 200).then(() => { throw new Error("Patient not found"); });
  ```
- Mutating functions call `persist()` after touching `db`, and take new ids from `nextId(kind)`.

## Sort order is part of the contract

- `listPatients` — newest registered first: `b.registeredAt.localeCompare(a.registeredAt)`
- `listAppointments` — `scheduledAt` **ascending**
- `listInvoices` — newest issued first

If you change a sort, change the contract line too.

## `client/src/types/index.ts`

- A single flat barrel of **entities only**, ordered to match the section order of `API_CONTRACT.md`:
  `Role` → `User` → `Sex` → `Patient` → `AppointmentStatus` → `Appointment` → `InvoiceStatus` →
  `InvoiceItem` → `Invoice`.
- Each status/union alias is declared **immediately above** the interface that uses it.
- All ids are `number`; all dates are ISO `string`; optional fields use `?`.
- Known intentional divergence: the contract inlines `"Male" | "Female" | "Other"` while the frontend
  names it `Sex`. That is fine — the *wire values* match, which is what counts.

## `client/src/mocks/`

- `db.ts` hydrates from `localStorage["cancer-hms-mock-db-v1"]`, falling back to `seedData.ts`; exports
  `db`, `persist()`, `resetMockDb()`, `nextId(kind)`, `delay(value, ms = 350)`.
- `seedData.ts` defines `MockUser = User & { password }` — the only place a password exists.
- Adding an entity means adding a seed array, a `db` field, and a `nextId` kind.
- Nothing outside `client/src/api/` may import from `mocks/`.

## Known open gaps (do not "fix" silently — they are real decisions)

- `getPatient` and `getInvoice` return `T | undefined`, while the contract specifies **404**. This is a
  swap point: when wiring the real API, decide whether to keep `undefined` or throw.
- Only 3 of 15 endpoints in the contract carry role annotations. `GET/POST/PATCH /api/invoices` read as
  unrestricted even though the UI gates the whole `/billing` route to ADMIN/RECEPTIONIST.

## At merge time

Only the **internals** of `client/src/api/*.ts` change (mock logic → `axios` against `/api/...`).
No page or component changes; `client/src/mocks/` is then deleted. `axios` is already a dependency and
is currently imported nowhere — it is reserved for exactly this. See the `/wire-api` command.
