---
name: role-gating
description: How role-based access control is enforced in the OncoCare frontend — the three places a restriction must be applied, and the current permission matrix. Load whenever adding or changing a role restriction, a nav item, a route, a ProtectedRoute wrapper, or any user.role conditional, and when auditing who can see or do what.
---

# Role gating

Roles: `ADMIN`, `DOCTOR`, `NURSE`, `RECEPTIONIST`, `PATIENT` (`Role` in `client/src/types/index.js`).

**`PATIENT` is not staff.** Since patients can sign in, "authenticated" no longer means "works here".
Never leave a route on a bare `<ProtectedRoute />` meaning "any signed-in user" unless you mean patients
too. The lists are named in `client/src/lib/roles.js` — `STAFF_ROLES` (the four staff roles),
`PATIENT_ROLES`, `ALL_ROLES` — and every route and nav entry uses one of them or an explicit array, so
"all roles" is always a stated decision rather than an omission. `homePathFor(role)` there is the other
half of it: it must never return a path the role itself cannot reach, or the guard's redirect loops.

## Nav hiding is not access control

Restricting a section requires up to **three** coordinated edits. Doing only the first hides a link
while leaving the URL fully reachable by typing it.

1. **Nav visibility** — add a `roles` list to the entry in `NAV_ITEMS`, at the top of
   `client/src/components/Layout.jsx`. The filter is
   `NAV_ITEMS.filter((item) => !item.roles || item.roles.includes(user.role))`. One list feeds both the
   desktop rail and the mobile drawer, so there is nothing to keep in step between them.
2. **Route guard (the actual enforcement point)** — wrap the route in
   `<ProtectedRoute allowedRoles={[...]} />` in `client/src/App.jsx`. See the billing route there.
   `ProtectedRoute` (`client/src/components/ProtectedRoute.jsx`) redirects to `/login` when there is no
   user and to the role's own home when the role is not allowed.
3. **In-page conditionals** — for actions rather than whole pages (a button, a field, a query),
   gate on `user?.role` from `useAuth()`.

Keep the role list identical across all three. A mismatch between `NAV_ITEMS` and `allowedRoles` is the
bug this skill exists to prevent.

## Current permission matrix

| Capability | Roles | Enforced at |
|---|---|---|
| `/`, `/patients`, `/patients/:id`, `/appointments` | `STAFF_ROLES` | `Layout.jsx` (nav) + `App.jsx` (guard) |
| `/billing` route | ADMIN, RECEPTIONIST | `Layout.jsx` (nav) + `App.jsx` (guard) |
| `/users` (staff accounts) | ADMIN | `Layout.jsx` (nav) + `App.jsx` (guard) |
| Billing summary card on dashboard | ADMIN, RECEPTIONIST | `DashboardPage.jsx` (`canSeeBilling`, also gates the query via `enabled:`) |
| Register patient | ADMIN, RECEPTIONIST | `PatientsListPage.jsx` (`canRegister`) |
| Edit patient — all fields | ADMIN, RECEPTIONIST | `PatientDetailPage.jsx` (`canEdit`) |
| Edit patient — clinical fields only | DOCTOR | `PatientDetailPage.jsx` (`clinicalOnly`) → `PatientFormDialog`'s `clinicalOnly` prop disables non-clinical inputs |
| Reschedule/cancel from a patient record | ADMIN, RECEPTIONIST | `PatientDetailPage.jsx` (`canManageBookings`) |
| `/my-bookings`, `/book` | `PATIENT_ROLES` | `Layout.jsx` (nav) + `App.jsx` (guard) |
| `/doctors`, `/doctors/:id` (doctor directory) | `ALL_ROLES` | `Layout.jsx` (nav) + `App.jsx` (guard) |
| `/profile` (own account) | `ALL_ROLES` | `App.jsx` (guard) — see note below on the missing nav entry |
| "Book with this doctor" CTA on a profile | PATIENT | `DoctorProfilePage.jsx` (`user?.role === "PATIENT"`) |
| Deactivate/reactivate a staff account | ADMIN, not on own account | `UsersPage.jsx` (own-row check) + `PATCH /api/users/:id/status` |

`/profile` has **no `NAV_ITEMS` entry** — it's reached by clicking the identity card (avatar + name) at
the bottom of the sidebar, in `Layout.jsx`'s `SidebarBody`, not a nav link. The route guard in `App.jsx`
still applies exactly like every other row in this table; only the nav *link* is gone. Don't read the
missing `NAV_ITEMS` line as a hole — check `App.jsx` instead.

`/profile` also has **no in-page role check**, and that is deliberate: it takes no user id and can only
ever edit the account the session token belongs to, so there is no one else's data for a check to
protect. What it must keep is the read-only `role` — an account that could raise its own would make
every row above decorative. The same goes for the API: `PATCH /api/auth/me` must reject `role` and
`patientId`.

Deactivating a staff account is the one row above with a **self-exclusion** rule instead of a role list:
any `ADMIN` may deactivate any *other* staff account, but `UsersPage.jsx` hides the action on the
signed-in admin's own row, and `PATCH /api/users/:id/status` documents the same restriction
server-side — deactivating the only admin who could undo it would lock everyone out.

Clinical fields for the DOCTOR case are `diagnosisType`, `diagnosisStage`, `notes`.

## The backend must enforce it too

Frontend gating is UX, not security. `API_CONTRACT.md` is where the server-side requirement is
communicated to the Spring Boot developer, so **a new restriction means a fourth edit**: annotate the
affected endpoints in the contract with `Allowed roles: ...`.

Every endpoint in the contract now carries an `Allowed roles:` clause except the three that come before
a session exists — `POST /api/auth/login`, `POST /api/auth/signup`, `GET /api/auth/me` — where the
notion does not apply. So silence in that file is now a bug rather than a backlog item: if you add an
endpoint without the clause, you have left the Java developer to guess. Several endpoints also carry a
scoping rule that no annotation can express on its own (a `PATIENT` is limited to their own record,
`DOCTOR` to clinical fields on their assigned patients) — those say **enforce server-side** in so many
words, and they mean it.

## Auth plumbing

`client/src/context/AuthContext.jsx` holds the current `User`, persists a token under
`localStorage["cancer-hms-token"]`, and exposes `login` / `signup` / `logout` / `loading`, plus
`updateProfile` and `changePassword` for the signed-in account's own details. The token is a mock
`mock-token-<userId>` decoded by `fetchCurrentUser` in `client/src/api/auth.js` — deliberately the same
shape a real JWT flow has, so `AuthContext` will not need to change when the backend is real.

Own-account calls take the **token**, never a user id (`updateProfile(token, input)`,
`changePassword(token, input)`), which is what makes "you may only edit yourself" structural rather than
a check someone can forget. Keep it that way when wiring the real API: the id belongs in the
`Authorization` header's token, not in the path.
