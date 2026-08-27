---
name: hms-frontend-conventions
description: House style for the Cancer HMS React frontend — file placement, naming, exports, TanStack Query usage, dialog/page split, and Tailwind rules. Load before writing or editing any file under client/src (pages, components, context, lib), and before adding a new page, dialog, or shared component.
---

# Cancer HMS frontend conventions

These are observed conventions from the existing code, not aspirations. New code should be
indistinguishable from what is already there.

## File placement and naming

- Pages: `PascalCase` + `Page` suffix — `PatientsListPage.tsx`, `BillingPage.tsx`.
  - Top-level pages sit directly in `client/src/pages/` (`DashboardPage.tsx`, `LoginPage.tsx`).
  - Feature pages go in a **lowercase plural** folder: `pages/patients/`, `pages/appointments/`, `pages/billing/`.
- Modal forms are named `XxxFormDialog.tsx` and live **beside their page** in the feature folder —
  `pages/patients/PatientFormDialog.tsx`. They do **not** go in `components/`.
- `client/src/components/` holds only genuinely shared primitives: `Badge`, `Layout`, `Modal`, `ProtectedRoute`.
  Do not add feature-specific components there.
- One component per file; the filename equals the component name.

## Exports and module style

- **Named exports everywhere**: `export function PatientsListPage() { ... }`.
  The only `export default` in `src/` is `App.tsx` — keep it that way.
- Small presentational helpers (`StatCard`, `Field`, `Row`) are **unexported** function components
  declared *below* the main component in the same file.
- Module-level `SCREAMING_SNAKE` consts for static config: `NAV_ITEMS`, `ROLE_LABEL`, `STATUS_OPTIONS`,
  `DEMO_ACCOUNTS`, `COLOR_MAP`, `EMPTY`, `STORAGE_KEY`, `TOKEN_KEY`.
- **Relative imports only** — `../../api/patients`. There is no `@/` alias configured; do not add one.
- `verbatimModuleSyntax` is on, so type-only imports **must** use `import type { Patient } from "../types";`.
- Style in `src/**`: double quotes, semicolons. (`main.tsx` and `vite.config.ts` are single-quoted
  leftovers from the Vite template — match the surrounding file, don't reformat them.)
- There is no formatter and no test runner in this repo. Verification is `pnpm --filter client lint`
  and `cd client && npx tsc -b`.

## Data fetching (TanStack Query)

- Query keys are plain string arrays: `["patients"]`, `["patients", patientId]`, `["doctors"]`,
  `["appointments"]`, `["invoices"]`, `["billing-summary"]`.
- Mutations always `invalidateQueries` in `onSuccess`. Billing mutations invalidate **two** keys —
  `["invoices"]` and `["billing-summary"]` — because the summary is derived.
- Conditionally-fetched data uses the `enabled:` flag rather than a conditional hook
  (see the billing stat card in `pages/DashboardPage.tsx`).
- **Dialogs never fetch.** The page runs the queries and passes `patients` / `doctors` arrays down as
  props, plus an `onSubmit: (input) => Promise<void>` that wraps `mutateAsync`. The dialog owns its own
  `submitting` and `error` state and closes itself on success.
- Error text is always derived the same way:
  ```ts
  err instanceof Error ? err.message : "Something went wrong"
  ```
- Pages and components call `client/src/api/*.ts` only. **Never import from `client/src/mocks/`** in a
  page or component — that boundary is what makes the real-backend swap a one-directory change.

## Styling

- Tailwind CSS v4 via the `@tailwindcss/vite` plugin. There is **no** `tailwind.config.js` and no
  `postcss.config.js` — do not create them. `client/src/index.css` is a single `@import "tailwindcss";`
  line; keep custom CSS out of it.
- Utility classes inline in JSX. The palette in use is `slate` for surfaces/text and `teal` for accents.
- Shared visual primitives are only `Modal.tsx` (overlay dialog: `{ title, onClose, children }`) and
  `Badge.tsx` (status pill with a `COLOR_MAP` covering all appointment and invoice statuses). Reuse them
  rather than hand-rolling a dialog or pill.
- Repeated form inputs use a module-level `inputClass` string plus a local `Field` component — see
  `pages/patients/PatientFormDialog.tsx`.

## Related

- Contract/type/api-layer rules: see the `api-contract-sync` skill.
- Anything touching roles, nav, or route access: see the `role-gating` skill.
