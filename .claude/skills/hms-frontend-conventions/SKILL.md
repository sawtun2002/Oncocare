---
name: hms-frontend-conventions
description: House style for the Cancer HMS React frontend — file placement, naming, exports, TanStack Query usage, dialog/page split, and Tailwind rules. Load before writing or editing any file under client/src (pages, components, context, lib), and before adding a new page, dialog, or shared component.
---

# Cancer HMS frontend conventions

These are observed conventions from the existing code, not aspirations. New code should be
indistinguishable from what is already there.

## File placement and naming

- Pages: `PascalCase` + `Page` suffix — `PatientsListPage.jsx`, `BillingPage.jsx`.
  - Top-level pages sit directly in `client/src/pages/` (`DashboardPage.jsx`, `LoginPage.jsx`).
  - Feature pages go in a **lowercase plural** folder: `pages/patients/`, `pages/appointments/`, `pages/billing/`.
- Modal forms are named `XxxFormDialog.jsx` and live **beside their page** in the feature folder —
  `pages/patients/PatientFormDialog.jsx`. They do **not** go in `components/`.
- `client/src/components/` holds only genuinely shared primitives: `Badge`, `ConfirmDialog`, `GlassCard`,
  `Layout`, `Modal`, `ProtectedRoute`, `Skeleton`, `StatCard`, `ThemeToggle`, `Toaster`. Do not add
  feature-specific components there.
- `client/src/context/` is one file per app-wide concern, each exporting a `XProvider` component **and**
  its `useX()` hook (`AuthContext`, `ThemeContext`, `ToastContext`). oxlint warns
  `only-export-components` on each — that warning is accepted here, not something to fix.
- `client/src/lib/` is plain functions and constants, no JSX: `format.js` (dates, currency, initials),
  `roles.js` (`STAFF_ROLES`, `PATIENT_ROLES`, `ALL_ROLES`, `homePathFor`), `ui.js` (class strings),
  `motion.js` (animation variants).
- One component per file; the filename equals the component name.

## Exports and module style

- **Named exports everywhere**: `export function PatientsListPage() { ... }`.
  The only `export default` in `src/` is `App.jsx` — keep it that way.
- Small presentational helpers (`StatCard`, `Field`, `Row`) are **unexported** function components
  declared *below* the main component in the same file.
- Module-level `SCREAMING_SNAKE` consts for static config: `NAV_ITEMS`, `ROLE_LABEL`, `STATUS_OPTIONS`,
  `DEMO_ACCOUNTS`, `COLOR_MAP`, `EMPTY`, `STORAGE_KEY`, `TOKEN_KEY`.
- **Relative imports only** — `../../api/patients`. There is no `@/` alias configured; do not add one.
- Import order within a file, as it is everywhere today: third-party (`@tanstack/react-query`,
  `framer-motion`, `react`, `react-router-dom`) → `../../api/*` → `../../components/*` →
  `../../context/*` → `../../lib/*` → siblings in the same feature folder. Roughly alphabetical inside
  each group.
- **This is plain JavaScript, not TypeScript.** No `import type`, no annotations, no `.ts`/`.tsx`.
  Entity shapes are JSDoc `@typedef`s in `client/src/types/index.js`, referenced from comments as
  `import("../types").Patient` — never imported at runtime.
- Style in `src/**`: double quotes, semicolons. (`main.jsx` and `vite.config.js` are single-quoted
  leftovers from the Vite template — match the surrounding file, don't reformat them.)
- There is no formatter, no test runner and no type-check. Verification is `pnpm --filter client lint`
  and `pnpm --filter client build`.

## Data fetching (TanStack Query)

- Query keys are plain string arrays: `["patients"]`, `["patients", patientId]`, `["doctors"]`,
  `["appointments"]`, `["invoices"]`, `["billing-summary"]`.
- Mutations always `invalidateQueries` in `onSuccess`. Billing mutations invalidate **two** keys —
  `["invoices"]` and `["billing-summary"]` — because the summary is derived.
- Conditionally-fetched data uses the `enabled:` flag rather than a conditional hook
  (see the billing stat card in `pages/DashboardPage.jsx`).
- **Dialogs never fetch.** The page runs the queries and passes `patients` / `doctors` arrays down as
  props, plus an `onSubmit: (input) => Promise<void>` that wraps `mutateAsync`. The dialog owns its own
  `submitting` and `error` state and closes itself on success — through the Modal's ref, see below.
- A mutation's `onSuccess` invalidates **and** confirms: `toast.success("…")` from `useToast()`. The
  dialog is gone by then, so the toast is the only thing left that can say it worked.
- Error text is always derived the same way:
  ```js
  err instanceof Error ? err.message : "Something went wrong"
  ```
  Where it goes: **inline** (the `errorText` class) when there is a form to put it next to, **toast**
  when there isn't — a `.mutate()` fired straight from a table row takes a per-call
  `{ onError: () => toast.error("…") }`.
- Loading states are skeletons in the shape of the content — `TableSkeleton`, `CardSkeleton`,
  `StatCard`'s `loading` prop — never the word "Loading".
- Pages and components call `client/src/api/*.js` only. **Never import from `client/src/mocks/`** in a
  page or component — that boundary is what makes the real-backend swap a one-directory change.

## Styling

- Tailwind CSS v4 via the `@tailwindcss/vite` plugin. There is **no** `tailwind.config.js` and no
  `postcss.config.js` — do not create them. Theme tokens and the `glass-panel` / `glass-panel-solid` /
  `chrome-text` utilities live in `client/src/index.css`; read its comments before adding to it.
- **The palette is semantic, not a Tailwind colour name.** Surfaces and text are `ice-*` / `ink-*` /
  `surface` / `hairline`; the accent is `frost-*` / `aqua-400`. Never write `bg-white`, `text-slate-*`
  or `bg-teal-*` — those do not follow the light/dark swap. `text-white` is the one exception, on the
  frost/aqua gradient, which is fixed in both themes.
- **Reach for `lib/ui.js` before writing a class string.** `inputClass`, `labelClass`, `btnPrimary`,
  `btnGhost`, `btnDanger`, `errorText`, `dangerAction`, `tableWrap`, `tableBase`, `tableHead`,
  `tableRow`, `pillBase`, `TONE`, `sectionLabel`, `pageTitle`. If a variant is needed twice, it belongs
  there, not inline. `dark:` variants are a smell outside that file — a token should have handled it.
- Motion tokens live in `lib/motion.js` and are used as `variants`. Do not hand-write durations or
  easings, and do not add a `prefers-reduced-motion` branch: `<MotionConfig reducedMotion="user">` in
  `main.jsx` handles it globally.
- Shared visual primitives, all in `components/` — reuse rather than hand-rolling:
  - `Modal` (`{ title, onClose, children, ref }`) — portalled, focus-trapping, Escape/backdrop
    dismissal, animated in and out. **A dialog closes itself with `modalRef.current?.close()`**, not by
    calling its own `onClose` prop: `onClose` is the page's unmount callback, which the Modal calls
    once the exit animation has finished. Calling it directly kills the animation.
  - `ConfirmDialog` — yes/no for anything destructive; don't build a bespoke one.
  - `Badge` (status pill, `COLOR_MAP` covers every appointment and invoice status), `GlassCard`,
    `StatCard`, `Skeleton` / `TableSkeleton` / `CardSkeleton`, `ThemeToggle`, `Toaster`.
- Repeated form inputs use `inputClass` plus a local `Field` component — see
  `pages/patients/PatientFormDialog.jsx`.
- Responsive: the shell handles the sidebar (permanent at `lg`, drawer below). Pages must still stack
  their own multi-column grids — `grid-cols-1 … sm:grid-cols-2`, never a bare `grid-cols-2` — and any
  table goes in `tableWrap` with `tableBase` so it scrolls sideways instead of crushing its columns.

## Related

- Contract/type/api-layer rules: see the `api-contract-sync` skill.
- Anything touching roles, nav, or route access: see the `role-gating` skill.
