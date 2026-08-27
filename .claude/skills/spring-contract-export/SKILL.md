---
name: spring-contract-export
description: Rules for translating API_CONTRACT.md into Java / Spring Boot artifacts (record DTOs, enums, controller signatures, JPA entities, error handling, @PreAuthorize) for the separate backend repo. Load when generating backend stubs or hand-off material, or when answering questions about how the Java backend should implement an endpoint.
---

# Contract → Spring Boot

The backend is **not in this repo** and must not be scaffolded here (a JS backend was tried and
explicitly reverted — see `CLAUDE.md`). Java output belongs in `docs/backend-stubs/` as hand-off
material for the other developer: reference documents, not a build target. Never create `server/`.

Target stack: Java + Spring Boot + Maven + PostgreSQL.

## Type mapping

| Contract (TS) | Java | Notes |
|---|---|---|
| `id: number` | `Long` | all ids |
| `patientId`, `doctorId`, `assignedDoctorId` | `Long` | FK |
| `durationMinutes: number` | `Integer` | |
| `quantity: number` | `Integer` | |
| `unitPrice: number` | `BigDecimal` | money — never `double` |
| `dob: string` (ISO **date**) | `LocalDate` | the only date-only field |
| `registeredAt`, `scheduledAt`, `issuedAt` (ISO **datetime**) | `OffsetDateTime` | serialize as ISO-8601 |
| `name`, `email`, `phone`, `address`, `notes`, `diagnosisType`, `diagnosisStage`, `reason`, `description` | `String` | |
| string union (`Role`, `AppointmentStatus`, `InvoiceStatus`) | `enum` | see below |
| `"Male" \| "Female" \| "Other"` (`sex`) | `enum Sex { Male, Female, Other }` | **mixed case on the wire** — do not upper-case it |
| `field?: T` | nullable field / nullable column | |
| `items: InvoiceItem[]` | `List<InvoiceItemDto>` | serialized inline on `Invoice`, not a separate fetch |

## Non-negotiables

- **Field names and casing are camelCase on the wire, exactly as in the contract.** Do not configure a
  Jackson `SNAKE_CASE` naming strategy; if entity fields are snake_case in Postgres, map them with
  `@Column(name = ...)` and leave the JSON alone. The frontend was built against these names — any
  change means frontend edits, which is the thing the contract exists to prevent.
- **Enum constants use the exact wire strings**: `SCHEDULED`, `COMPLETED`, `CANCELLED` (double L),
  `NO_SHOW`, `UNPAID`, `PARTIAL`, `PAID`, `ADMIN`, `DOCTOR`, `NURSE`, `RECEPTIONIST`.
- **Error envelope**: every 4xx/5xx returns `{ "error": "<message>" }`. The frontend surfaces
  `error` directly in form UI, so the message must be human-readable. Implement once in a
  `@RestControllerAdvice`.
- **Auth**: `Authorization: Bearer <token>` on all endpoints except `POST /api/auth/login`.
  `POST /api/auth/login` → `{ token, user }`; `GET /api/auth/me` → `User`; 401 on bad/expired.
  A `User` returned to the client **never** includes a password field.
- **Sort order is contract, not preference**: patients newest-registered first, invoices newest-issued
  first, appointments by `scheduledAt` ascending. Enforce server-side.
- `GET /api/billing/summary` → `{ totalRevenue, outstanding, invoiceCount }`, where `totalRevenue` sums
  `PAID` invoices and `outstanding` sums non-`PAID` invoices.

## Shape conventions for generated stubs

- DTOs as Java `record`s, one per contract interface, named `PatientDto`, `AppointmentDto`, etc.;
  request bodies as `PatientRequest`, `AppointmentRequest`, `CreateInvoiceRequest`.
- Controllers as interfaces with the mapping annotations and full signatures, so the backend developer
  supplies only the implementation:
  ```java
  @PostMapping("/api/patients")
  @PreAuthorize("hasAnyRole('ADMIN','RECEPTIONIST')")
  PatientDto create(@RequestBody @Valid PatientRequest body);
  ```
- Role restrictions become `@PreAuthorize("hasAnyRole('ADMIN','RECEPTIONIST')")`. Where the contract
  says a role is limited to certain *fields* (DOCTOR may patch only `diagnosisType`, `diagnosisStage`,
  `notes`, on assigned patients), a method annotation is not enough — emit a `// TODO: enforce
  server-side` note in the service layer stub.
- Where the contract is **silent** on roles, emit an explicit `// roles: unspecified in
  API_CONTRACT.md` marker rather than guessing. Silence is a gap to resolve, not permission.

## Open items to flag in any hand-off

- The contract now annotates all 23 endpoints except the three that precede a session
  (`POST /api/auth/login`, `POST /api/auth/signup`, `GET /api/auth/me`), so `@PreAuthorize` can be
  emitted from the document rather than guessed. What it *cannot* express is the per-row scoping several
  endpoints carry in prose — a `PATIENT` restricted to their own record, a `DOCTOR` to clinical fields on
  assigned patients. Those need service-layer checks, and the hand-off must say so out loud.
- `PATCH /api/auth/me` and `POST /api/auth/me/password` identify the account from the principal, not from
  a path variable. Do not add an `{id}` to them "for consistency" — the absence is the access control.
- `GET /api/patients/:id` and `GET /api/invoices/:id` are specified as 404-on-missing, but the mock
  frontend currently returns `undefined`. The backend should implement 404 per the contract.
