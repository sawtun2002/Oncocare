---
description: Audit API_CONTRACT.md against the frontend types, api modules, and role gating; report drift without editing
argument-hint: "[optional: resource to focus on, e.g. billing]"
allowed-tools: Agent, Read, Grep, Glob
---

Audit contract ↔ code parity. **Make no edits** — this command reports only. If the user wants fixes,
they will ask after seeing the report.

Launch both auditors **in parallel, in a single message**:

- the `contract-auditor` agent — entity fields, casing, optionality, union values, `*Input` aliases,
  endpoint coverage in both directions, return shapes, sort order, and `mocks/` import-boundary violations
- the `role-gating-auditor` agent — `NAV_ITEMS` ↔ `ProtectedRoute` ↔ in-page `user.role` conditionals ↔
  contract `Allowed roles:` annotations

If `$ARGUMENTS` names a resource (patients, appointments, billing, users, auth), tell both agents to
focus there but still report anything severe they notice elsewhere.

Then merge their reports into one, de-duplicated, ordered most severe first:

1. **BREAKING** — would make the real Spring Boot backend incompatible with the frontend (field name or
   casing, union value, endpoint path, required-vs-optional).
2. **HOLE / MISMATCH** — a role restriction that is bypassable, or layers disagreeing on a role list.
3. **DRIFT** — shape or behaviour differences fixable on either side.
4. **GAP** — something the contract does not say and should.

For each finding give the contract location, the code location, and the one concrete edit that resolves
it — including *which side should change*. The default is that `API_CONTRACT.md` wins and the frontend
adapts, since a separate developer is building the Java backend against it; say so explicitly when you
recommend the reverse.

Two findings are already known to exist. If the merged report does not contain them, the auditors are
malfunctioning — say so rather than reporting a clean bill of health:

- 12 of 15 contract endpoints have no `Allowed roles:` annotation; `/api/invoices` in particular reads as
  unrestricted while the UI gates all of `/billing` to ADMIN/RECEPTIONIST.
- `getPatient` / `getInvoice` return `T | undefined` while the contract specifies 404.

Finish with a one-line verdict and, if there are findings, the single highest-value fix to make first.
