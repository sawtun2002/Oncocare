---
name: role-gating
description: How role-based access control is enforced in the Cancer HMS frontend — the three places a restriction must be applied, and the current permission matrix. Load whenever adding or changing a role restriction, a nav item, a route, a ProtectedRoute wrapper, or any user.role conditional, and when auditing who can see or do what.
---

# Role gating

Roles: `ADMIN`, `DOCTOR`, `NURSE`, `RECEPTIONIST` (`Role` in `client/src/types/index.ts`).

## Nav hiding is not access control

Restricting a section requires up to **three** coordinated edits. Doing only the first hides a link
while leaving the URL fully reachable by typing it.

1. **Nav visibility** — add `roles?: Role[]` to the entry in `NAV_ITEMS`,
   `client/src/components/Layout.tsx:11-16`. The filter is
   `NAV_ITEMS.filter((item) => !item.roles || item.roles.includes(user.role))`.
2. **Route guard (the actual enforcement point)** — wrap the route in
   `<ProtectedRoute allowedRoles={[...]} />` in `client/src/App.tsx`. See the billing route at
   `App.tsx:23-25`. `ProtectedRoute` (`client/src/components/ProtectedRoute.tsx`) redirects to
   `/login` when there is no user and to `/` when the role is not allowed.
3. **In-page conditionals** — for actions rather than whole pages (a button, a field, a query),
   gate on `user?.role` from `useAuth()`.

Keep the role list identical across all three. A mismatch between `NAV_ITEMS` and `allowedRoles` is the
bug this skill exists to prevent.

## Current permission matrix

| Capability | Roles | Enforced at |
|---|---|---|
| `/billing` route | ADMIN, RECEPTIONIST | `Layout.tsx:15` (nav) + `App.tsx:23` (guard) |
| Billing summary card on dashboard | ADMIN, RECEPTIONIST | `DashboardPage.tsx:12` (`canSeeBilling`, also gates the query via `enabled:`) |
| Register patient | ADMIN, RECEPTIONIST | `PatientsListPage.tsx:24` (`canRegister`) |
| Edit patient — all fields | ADMIN, RECEPTIONIST | `PatientDetailPage.tsx:33` (`canEdit`) |
| Edit patient — clinical fields only | DOCTOR | `PatientDetailPage.tsx:34` (`clinicalOnly`) → `PatientFormDialog`'s `clinicalOnly` prop disables non-clinical inputs |
| Everything else (dashboard, patients list/detail, appointments) | all four roles | — |

Clinical fields for the DOCTOR case are `diagnosisType`, `diagnosisStage`, `notes`.

## The backend must enforce it too

Frontend gating is UX, not security. `API_CONTRACT.md` is where the server-side requirement is
communicated to the Spring Boot developer, so **a new restriction means a fourth edit**: annotate the
affected endpoints in the contract with `Allowed roles: ...`.

Known gap: only 3 of the 15 contract endpoints currently carry role annotations
(`POST /api/patients`, `PATCH /api/patients/:id`, `GET /api/billing/summary`). In particular
`GET/POST/PATCH /api/invoices` read as unrestricted while the UI gates all of `/billing`. Surface this
when auditing; don't assume silence in the contract means "public".

## Auth plumbing

`client/src/context/AuthContext.tsx` holds the current `User`, persists a token under
`localStorage["cancer-hms-token"]`, and exposes `login` / `logout` / `loading`. The token is a mock
`mock-token-<userId>` decoded by `fetchCurrentUser` in `client/src/api/auth.ts` — deliberately the same
shape a real JWT flow has, so `AuthContext` will not need to change when the backend is real.
