# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Cancer HMS — a hospital management system for cancer care covering patient records, appointments, and billing, with role-based access (Admin, Doctor, Nurse, Receptionist).

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
pnpm --filter client build         # tsc -b && vite build
pnpm --filter client lint          # oxlint
pnpm --filter client preview       # preview a production build
```

Type-check only (no emit needed for dev, but useful for verification):

```bash
cd client && npx tsc -b
```

There is no test runner configured yet.

## Architecture

### Backend is not in this repo (yet)

There is deliberately no `server/` directory. The backend will be built **separately in Java + Spring Boot + Maven, backed by PostgreSQL**, by a different developer — do not scaffold a Node/Express/Prisma (or any JS) backend here; that approach was tried and explicitly reverted early in this project's history. The REST contract the Spring Boot backend must implement is fully specified in [`API_CONTRACT.md`](./API_CONTRACT.md) — treat it as the source of truth for endpoint paths, JSON field names/casing, and role restrictions when discussing or stubbing backend behavior.

### Frontend is mock-API-first by design

`client/` is a fully working React app that runs entirely against an **in-browser mock backend** — there is no real HTTP API yet. This is intentional, not a placeholder to "finish": the frontend was built to be usable and demoable before the real backend exists, and the two are meant to converge later by editing only the API layer.

The mock architecture, and the contract it must keep, matters for any future change:

- `client/src/mocks/seedData.ts` + `client/src/mocks/db.ts` — the fake datastore. `db.ts` loads from `localStorage` (falling back to seed data), and exposes `persist()`, `nextId()`, and a `delay()` helper that simulates network latency so loading states behave realistically.
- `client/src/api/*.ts` (`auth.ts`, `users.ts`, `patients.ts`, `appointments.ts`, `billing.ts`) — one module per resource, each exporting `async` functions whose names/signatures/return shapes are written to match `API_CONTRACT.md` exactly (e.g. `listPatients()`, `createInvoice(input)`, `updateAppointmentStatus(id, status)`). Pages and components only ever call these functions, never touch `mocks/` directly.
- **When the real Spring Boot API is ready, only the internals of `client/src/api/*.ts` should change** (swap the mock-data logic for `axios` calls against `/api/...` per the contract). No page or component should need to change, and `client/src/mocks/` can then be deleted. Keep this separation intact — don't let pages import from `mocks/` directly, and don't change an `api/*.ts` function's signature without updating `API_CONTRACT.md` to match.

### Auth and role-gating

Auth is a mock JWT-like flow (`api/auth.ts` issues a fake `mock-token-<userId>` and `fetchCurrentUser` decodes it) — same shape a real JWT flow would have, so `AuthContext` won't need to change when the backend is real.

- `client/src/context/AuthContext.tsx` — holds the current `User`, persists the token in `localStorage`, exposes `login`/`logout`.
- `client/src/components/ProtectedRoute.tsx` — route guard; takes an optional `allowedRoles` and redirects to `/login` (no user) or `/` (wrong role). This is the actual enforcement point — role checks live here and in per-page conditionals, not just in nav visibility.
- `client/src/components/Layout.tsx` — sidebar nav items are filtered by role via a `roles?: Role[]` field per item (see `NAV_ITEMS`). Adding a role-restricted section requires updating **both** the nav filter here and a `ProtectedRoute allowedRoles=...` wrapper in `App.tsx` — the nav hiding alone is not access control.
- Roles: `ADMIN`, `DOCTOR`, `NURSE`, `RECEPTIONIST`. Current restrictions: Billing is `ADMIN`/`RECEPTIONIST` only; patient create is `ADMIN`/`RECEPTIONIST`; patient edit is `ADMIN`/`RECEPTIONIST` (full fields) or `DOCTOR` (clinical fields only, via `PatientFormDialog`'s `clinicalOnly` prop).

### Data model

Shared types live in `client/src/types/index.ts` (`User`, `Patient`, `Appointment`, `Invoice`, `InvoiceItem`, and their status/role unions). These mirror the entities in `API_CONTRACT.md` field-for-field — if one changes, update the other.

### Styling

Tailwind CSS v4 via the `@tailwindcss/vite` plugin (no `tailwind.config.js` — v4 is configured via the Vite plugin and a single `@import "tailwindcss";` in `client/src/index.css`). There is no separate component library; UI is built with Tailwind utility classes directly, with `Modal.tsx` and `Badge.tsx` as the only shared visual primitives.

## Claude Code tooling

This repo ships its own commands, agents, skills and hooks in [`.claude/`](./.claude/) — see
[`.claude/README.md`](./.claude/README.md) for the full list and how the hooks work.

| Command | Use it for |
|---|---|
| `/verify` | The local gate: oxlint → `tsc -b` → build. There is no test runner. |
| `/contract-check [resource]` | Audit `API_CONTRACT.md` against types, api modules and role gating. Reports only. |
| `/new-slice <Resource>` | Scaffold a full resource slice, contract section included. |
| `/wire-api <resource\|all>` | Swap an `api/*.ts` module from the mock datastore to real axios calls. |
| `/backend-handoff` | Generate Java/Spring stubs + briefing into `docs/backend-stubs/`. |

Hooks enforce, rather than merely document, four of the rules above: npm/yarn are blocked, so are
`package-lock.json`, JS/TS files under `server/`, and `mocks/` imports from pages/components/context.
Edited `client/src` files are linted automatically. Hooks are snapshotted at session start — restart
Claude Code after changing them.

## Key docs

- [`README.md`](./README.md) — setup instructions and demo account credentials.
- [`API_CONTRACT.md`](./API_CONTRACT.md) — the full REST contract the Java backend must implement, and the merge plan for wiring it up.
- [`.claude/README.md`](./.claude/README.md) — the Claude Code commands, agents, skills and hooks in this repo.
