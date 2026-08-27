---
description: Scaffold a complete frontend resource slice (types, api module, mocks, page, dialog, route, nav, contract section) following house conventions
argument-hint: <Resource> [restricted-to ROLE,ROLE]
allowed-tools: Read, Write, Edit, Grep, Glob, Bash, Skill
---

Scaffold a full frontend slice for the resource named in `$ARGUMENTS`, matching the existing code so
closely that it is indistinguishable from what is already there.

**Load the `hms-frontend-conventions` and `api-contract-sync` skills first.** If the slice is
role-restricted, load `role-gating` too.

Before writing anything, read `client/src/api/patients.ts`, `client/src/pages/patients/PatientsListPage.tsx`
and `client/src/pages/patients/PatientFormDialog.tsx` as the reference implementation. Patients is the
canonical slice — mirror its structure.

## Ask first, if unclear

If the resource's fields, its status union (if any), or its role restrictions are not obvious from
`$ARGUMENTS` and the existing model, ask the user before generating. Do not invent a schema for a
clinical domain — guessing at fields like dosage, stage, or lab values is worse than asking.

## The eight touch points — all of them, in this order

1. **`client/src/types/index.ts`** — the entity interface, plus its status union declared immediately
   above it. Append in contract order. Entities only: no `*Input` types here. Ids are `number`, dates are
   ISO `string`, optionals use `?`.
2. **`client/src/api/<resource>.ts`** — the four-part module shape: `import { db, delay, nextId, persist }`
   → `import type` → exported `Omit<>`-derived `Input` alias → exported `async` functions returning
   `delay(...)`. Use the exact not-found idiom. Call `persist()` after mutations and `nextId(kind)` for ids.
3. **`client/src/mocks/seedData.ts`** — a `seed<Resource>s` array with 2–3 realistic rows that reference
   existing seeded patient/doctor ids.
4. **`client/src/mocks/db.ts`** — add the field to the store, the seed fallback, and a `nextId` kind.
5. **`client/src/pages/<plural>/<Resource>sPage.tsx`** — list page: TanStack `useQuery` with a
   `["<plural>"]` key, a table, and a create button gated by role if applicable. Helper components
   (`StatCard`-style) stay unexported below the main component.
6. **`client/src/pages/<plural>/<Resource>FormDialog.tsx`** — beside the page, not in `components/`.
   Wraps `Modal`. Takes any lookup arrays as props (it must not fetch), plus
   `onSubmit: (input) => Promise<void>`; owns `submitting`/`error`; closes on success; error text via
   `err instanceof Error ? err.message : "Something went wrong"`.
7. **`client/src/App.tsx`** — the route, inside `<Layout>`; wrapped in
   `<ProtectedRoute allowedRoles={[...]} />` if restricted.
   **`client/src/components/Layout.tsx`** — the `NAV_ITEMS` entry, with a matching `roles` list.
   These two role lists must be identical.
8. **`API_CONTRACT.md`** — a new `##` section in the existing style: one bullet per endpoint
   (`` - `GET /api/<plural>` — → `X[]`, <sort order>. ``), an `Allowed roles:` clause on every restricted
   endpoint, then a single fenced `ts` block with the interface and `Input` alias. Match the section
   ordering used in `types/index.ts`.

Step 8 is **not optional**. A slice without a contract section is incomplete — the Java backend developer
works only from that file. If you cannot complete it, stop and say so rather than shipping the rest.

## Finish

Run the verification gate — `pnpm --filter client lint`, `pnpm --filter client exec tsc -b` — and fix
what it reports. pnpm only, never npm or yarn.

Then summarise: the files created or edited (clickable paths), the endpoints added to the contract, and
anything you had to assume about the schema so the user can correct it.
