---
description: Scaffold a complete frontend resource slice (types, api module, mocks, page, dialog, route, nav, contract section) following house conventions
argument-hint: <Resource> [restricted-to ROLE,ROLE]
allowed-tools: Read, Write, Edit, Grep, Glob, Bash, Skill
---

Scaffold a full frontend slice for the resource named in `$ARGUMENTS`, matching the existing code so
closely that it is indistinguishable from what is already there.

**Load the `hms-frontend-conventions` and `api-contract-sync` skills first.** If the slice is
role-restricted, load `role-gating` too.

Before writing anything, read `client/src/api/patients.js`, `client/src/pages/patients/PatientsListPage.jsx`
and `client/src/pages/patients/PatientFormDialog.jsx` as the reference implementation. Patients is the
canonical slice — mirror its structure.

## Ask first, if unclear

If the resource's fields, its status union (if any), or its role restrictions are not obvious from
`$ARGUMENTS` and the existing model, ask the user before generating. Do not invent a schema for a
clinical domain — guessing at fields like dosage, stage, or lab values is worse than asking.

## The eight touch points — all of them, in this order

1. **`client/src/types/index.js`** — the entity as a JSDoc `@typedef`, plus its status union declared
   immediately above it. Append in contract order. Entities only: no `*Input` shapes here. Ids are
   `number`, dates are ISO `string`, optionals are `[bracketed]` in the `@property` line.
2. **`client/src/api/<resource>.js`** — the three-part module shape:
   `import { db, delay, nextId, persist } from "../mocks/db"` → a `@typedef` for the `Input` shape,
   documented in this file and nowhere else → exported `async` functions returning `delay(...)`. Use the
   exact not-found idiom. Call `persist()` after mutations and `nextId(kind)` for ids.
3. **`client/src/mocks/seedData.js`** — a `seed<Resource>s` array with 2–3 realistic rows that reference
   existing seeded patient/doctor ids.
4. **`client/src/mocks/db.js`** — add the field to the store, the seed fallback, and a `nextId` kind.
5. **`client/src/pages/<plural>/<Resource>sPage.jsx`** — list page: TanStack `useQuery` with a
   `["<plural>"]` key, a table (`tableWrap` + `tableBase` + `tableHead` + `tableRow` from `lib/ui.js`),
   and a create button gated by role if applicable. Loading state is `<TableSkeleton columns={n} />`,
   not the word "Loading". Mutations confirm with `useToast()` in `onSuccess`. Helper components
   (`StatCard`-style) stay unexported below the main component.
6. **`client/src/pages/<plural>/<Resource>FormDialog.jsx`** — beside the page, not in `components/`.
   Wraps `Modal`. Takes any lookup arrays as props (it must not fetch), plus
   `onSubmit: (input) => Promise<void>`; owns `submitting`/`error`; error text via
   `err instanceof Error ? err.message : "Something went wrong"`. It closes itself through the Modal's
   ref — `const modalRef = useRef(null)`, `<Modal ... ref={modalRef}>`, and `modalRef.current?.close()`
   for both Cancel and a successful submit. Calling the `onClose` prop directly unmounts the dialog
   mid-animation; that prop is for the Modal to call when its exit finishes.
7. **`client/src/App.jsx`** — the route, inside `<Layout>`; wrapped in
   `<ProtectedRoute allowedRoles={[...]} />` if restricted.
   **`client/src/components/Layout.jsx`** — the `NAV_ITEMS` entry, with a matching `roles` list.
   These two role lists must be identical.
8. **`API_CONTRACT.md`** — a new `##` section in the existing style: one bullet per endpoint
   (`` - `GET /api/<plural>` — → `X[]`, <sort order>. ``), an `Allowed roles:` clause on every restricted
   endpoint, then a single fenced `ts` block with the interface and `Input` alias. Match the section
   ordering used in `types/index.js`.

Step 8 is **not optional**. A slice without a contract section is incomplete — the Java backend developer
works only from that file. If you cannot complete it, stop and say so rather than shipping the rest.

## Finish

Run the verification gate — `pnpm --filter client lint` and `pnpm --filter client build` — and fix
what it reports. pnpm only, never npm or yarn.

Then summarise: the files created or edited (clickable paths), the endpoints added to the contract, and
anything you had to assume about the schema so the user can correct it.
