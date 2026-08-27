# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

OncoCare — a hospital management system for cancer care covering patient records, appointments, and billing, with role-based access (Admin, Doctor, Nurse, Receptionist) plus a patient-facing booking portal (Patient).

## Package manager: pnpm only

This repo uses **pnpm workspaces** (`pnpm-workspace.yaml`). Do not use `npm` or `yarn` — do not run `npm install` or generate a `package-lock.json`.

## Commands

Run from the repo root unless noted:

```bash
pnpm install                       # install all workspace deps
pnpm dev                           # run the client dev server (proxies to `client`)
pnpm build                         # build the client (proxies to `client`)
```

Or scoped directly to the client package:

```bash
pnpm --filter client dev           # vite dev server on :5173
pnpm --filter client build         # vite build
pnpm --filter client lint          # oxlint
pnpm --filter client preview       # preview a production build
```

There is no test runner configured yet, and no type-check step: `client/` is plain JavaScript (JSX),
not TypeScript. `client/jsconfig.json` exists for editor intellisense only — it sets `checkJs: false`
and nothing in the build reads it. Entity shapes are documented as JSDoc `@typedef` blocks in
`client/src/types/index.js`; they are machine-readable for tooling and editors, but they are not
checked by any command. **`lint` and `build` are the whole gate** — do not add a `tsc` step or
reintroduce TypeScript.

## Architecture

### Backend is not in this repo (yet)

There is deliberately no `server/` directory. The backend will be built **separately in Java + Spring Boot + Maven, backed by PostgreSQL**, by a different developer — do not scaffold a Node/Express/Prisma (or any JS) backend here; that approach was tried and explicitly reverted early in this project's history. The REST contract the Spring Boot backend must implement is fully specified in [`API_CONTRACT.md`](./API_CONTRACT.md) — treat it as the source of truth for endpoint paths, JSON field names/casing, and role restrictions when discussing or stubbing backend behavior.

### Frontend is mock-API-first by design

`client/` is a fully working React app that runs entirely against an **in-browser mock backend** — there is no real HTTP API yet. This is intentional, not a placeholder to "finish": the frontend was built to be usable and demoable before the real backend exists, and the two are meant to converge later by editing only the API layer.

The mock architecture, and the contract it must keep, matters for any future change:

- `client/src/mocks/seedData.js` + `client/src/mocks/db.js` — the fake datastore. `db.js` loads from `localStorage` (falling back to seed data), and exposes `persist()`, `nextId()`, and a `delay()` helper that simulates network latency so loading states behave realistically.
- `client/src/api/*.js` (`auth.js`, `users.js`, `patients.js`, `appointments.js`, `billing.js`) — one module per resource, each exporting `async` functions whose names/signatures/return shapes are written to match `API_CONTRACT.md` exactly (e.g. `listPatients()`, `createInvoice(input)`, `updateAppointmentStatus(id, status)`). Pages and components only ever call these functions, never touch `mocks/` directly.
- **When the real Spring Boot API is ready, only the internals of `client/src/api/*.js` should change** (swap the mock-data logic for `axios` calls against `/api/...` per the contract). No page or component should need to change, and `client/src/mocks/` can then be deleted. Keep this separation intact — don't let pages import from `mocks/` directly, and don't change an `api/*.js` function's signature without updating `API_CONTRACT.md` to match.

### Auth and role-gating

Auth is a mock JWT-like flow (`api/auth.js` issues a fake `mock-token-<userId>` and `fetchCurrentUser` decodes it) — same shape a real JWT flow would have, so `AuthContext` won't need to change when the backend is real.

- `client/src/context/AuthContext.jsx` — holds the current `User`, persists the token in `localStorage`, exposes `login`/`signup`/`logout`, plus `updateProfile`/`updateAvatar`/`updateNotificationPreferences`/`changePassword` for the signed-in account's own settings.
- `client/src/components/ProtectedRoute.jsx` — route guard; takes an optional `allowedRoles` and redirects to `/login` (no user) or the role's own home (wrong role). This is the actual enforcement point — role checks live here and in per-page conditionals, not just in nav visibility.
- `client/src/components/Layout.jsx` — sidebar nav items are filtered by role via a `roles` field per item (see `NAV_ITEMS`). Adding a role-restricted section requires updating **both** the nav filter here and a `ProtectedRoute allowedRoles=...` wrapper in `App.jsx` — the nav hiding alone is not access control. `/profile` is the deliberate exception to "every route has a nav entry": it's reached by clicking the identity card at the bottom of the sidebar (avatar + name), not a `NAV_ITEMS` line — the route guard still applies exactly as normal, only the nav *link* is gone.
- Roles: `ADMIN`, `DOCTOR`, `NURSE`, `RECEPTIONIST`, `PATIENT`. **`PATIENT` is not staff** — the four staff roles are `STAFF_ROLES` in `client/src/lib/roles.js`, and a route that means "signed in" must say which of the two it means. Current restrictions: Billing management (`/billing`) is `ADMIN`/`RECEPTIONIST` only, but a `PATIENT` can read their own bill, itemized, at `/my-bills`; patient create is `ADMIN`/`RECEPTIONIST`; patient edit is `ADMIN`/`RECEPTIONIST` (full fields) or `DOCTOR` (clinical fields only — `diagnosisType`/`diagnosisStage`/`bloodType`/`allergies`/`medicalHistory`/`notes` — via `PatientFormDialog`'s `clinicalOnly` prop; emergency contact stays registrar-only, like phone/address); the doctor directory and `/profile` are open to every role; deactivating a staff account (`/users`, `PATCH /api/users/:id/status`) is `ADMIN` only.
- `/profile` (`pages/profile/ProfilePage.jsx`) edits the **signed-in** account only. It takes no user id — the account comes from the session token — which is why it needs no role check. `role` is displayed read-only there on purpose: an account able to raise its own role would make every other check on this list decorative.
- `User.status` (`"ACTIVE" | "INACTIVE"`) is how an ADMIN removes a staff account from `/users` — a status flip, not a delete, so a doctor's assigned patients and existing appointments are untouched. `auth.login()` rejects an `INACTIVE` account (checked only *after* the password already matches, so it can't be used to probe which emails exist); the frontend also drops `INACTIVE` doctors out of `SlotPicker`'s and `PatientFormDialog`'s pickers for *new* bookings/assignments, while leaving any existing selection visible.

### Data model

Shared entity shapes live in `client/src/types/index.js` (`User`, `Patient`, `Appointment`, `Invoice`, `InvoiceItem`, and their status/role unions) as JSDoc `@typedef` blocks. Nothing enforces them at build time — they exist so editors autocomplete and so `/contract-check`, the `contract-auditor` agent and the Java hand-off have a machine-readable target. They mirror the entities in `API_CONTRACT.md` field-for-field: if one changes, change the other in the same edit.

### Styling

Tailwind CSS v4 via the `@tailwindcss/vite` plugin (no `tailwind.config.js` — v4 is configured via the Vite plugin). `client/src/index.css` is **not** a bare `@import "tailwindcss";` any more: it defines the light/dark palette as CSS custom properties, maps them through `@theme inline` (which is what lets a theme swap at runtime), and declares the `glass-panel`, `glass-panel-solid` and `chrome-text` utilities. Read its comments before touching colour — the ice-/ink- scales are ordered by contrast against the page, not by lightness.

There is no component library. Repeated class strings live as exported constants in `client/src/lib/ui.js` (`inputClass`, `btnPrimary`, `tableWrap`, `tableBase`, `TONE`, …) rather than being copy-pasted; add to that file instead of re-typing a variant.

### Shared UI primitives

All in `client/src/components/`, and all worth reusing rather than re-rolling:

- `Modal.jsx` — the overlay dialog, `{ title, onClose, children, ref }`. It portals to `document.body`, is a real `role="dialog" aria-modal="true"`, traps Tab, closes on Escape and backdrop click, and restores focus to whatever opened it. **Closing is two-stage**: `onClose` is the page's unmount callback and the Modal calls it only after the exit animation finishes, so a dialog that wants to close itself (Cancel, or a successful submit) must call `modalRef.current.close()` — calling its own `onClose` prop instead unmounts mid-animation. Every dialog in `pages/` follows this.
- `Skeleton.jsx` — `Skeleton`, `TableSkeleton`, `CardSkeleton`. Loading states are placeholders in the shape of the content, not the word "Loading". `StatCard` takes a `loading` prop for the same reason.
- `ConfirmDialog.jsx`, `GlassCard.jsx`, `StatCard.jsx`, `Badge.jsx`, `ThemeToggle.jsx`, `Toaster.jsx`.

### Toasts

`client/src/context/ToastContext.jsx` exposes `useToast()` → `{ success, error, info }`. The rule: a mutation that closes its dialog on success has nowhere left to say it worked, so it says so in an `onSuccess` toast. A failure *inside a form* stays inline next to the form (`errorText` in `lib/ui.js`); a failure with no form to fail in — a status `<select>` in a table row calling `.mutate()` — is toasted via a per-call `{ onError }`.

### Motion

`framer-motion`, with shared variants in `client/src/lib/motion.js` (`backdropMotion`, `panelMotion`, `pageMotion`, `toastMotion`, `drawerMotion`). `main.jsx` wraps the app in `<MotionConfig reducedMotion="user">`, which is the single place `prefers-reduced-motion` is honoured — no variant needs its own branch. Route transitions live in `Layout.jsx` and use `useOutlet()` rather than `<Outlet />`, so the page that fades out is the page that was there.

### Responsive shell

`Layout.jsx` renders a permanent sidebar from `lg` up and the same `<SidebarBody>` as an off-canvas drawer below it. Both are driven by one `NAV_ITEMS` list, so a nav entry cannot exist in one and not the other. Data tables scroll sideways rather than crushing their columns: the overflow is on `tableWrap`, the minimum width on `tableBase`.

## Claude Code tooling

This repo ships its own commands, agents, skills and hooks in [`.claude/`](./.claude/) — see
[`.claude/README.md`](./.claude/README.md) for the full list and how the hooks work.

| Command | Use it for |
|---|---|
| `/verify` | The local gate: oxlint → build. There is no test runner and no type-check. |
| `/contract-check [resource]` | Audit `API_CONTRACT.md` against types, api modules and role gating. Reports only. |
| `/new-slice <Resource>` | Scaffold a full resource slice, contract section included. |
| `/wire-api <resource\|all>` | Swap an `api/*.js` module from the mock datastore to real axios calls. |
| `/backend-handoff` | Generate Java/Spring stubs + briefing into `docs/backend-stubs/`. |

Hooks enforce, rather than merely document, four of the rules above: npm/yarn are blocked, so are
`package-lock.json`, JS/TS files under `server/`, and `mocks/` imports from pages/components/context.
Edited `client/src` files are linted automatically. Hooks are snapshotted at session start — restart
Claude Code after changing them.

## Key docs

- [`README.md`](./README.md) — setup instructions and demo account credentials.
- [`API_CONTRACT.md`](./API_CONTRACT.md) — the full REST contract the Java backend must implement, and the merge plan for wiring it up.
- [`.claude/README.md`](./.claude/README.md) — the Claude Code commands, agents, skills and hooks in this repo.
