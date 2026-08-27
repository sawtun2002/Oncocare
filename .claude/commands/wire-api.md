---
description: Swap one (or all) client/src/api modules from the mock datastore to real axios calls against the Spring Boot API
argument-hint: <resource|all>
allowed-tools: Read, Write, Edit, Grep, Glob, Bash, Skill
---

Wire the api module named in `$ARGUMENTS` (`auth`, `users`, `patients`, `appointments`, `billing`, or
`all`) to the real Spring Boot backend.

**Load the `api-contract-sync` skill first.** `API_CONTRACT.md` is the specification — read the relevant
section before touching the module, and follow its paths, methods, and field names exactly.

This is the merge step the whole frontend was designed around. `axios` is already a dependency and is
currently imported nowhere — it exists for this.

## The hard constraint

**Exported signatures must not change, and the diff must not extend beyond `client/src/api/` and
`client/vite.config.ts`.**

No page, component, context, or type may need editing. If you find yourself wanting to change one, the
api module is wrong — fix the api module instead. Verify with `git diff --name-only` before you finish
and report any file outside those two locations as a failure.

## First run only: shared plumbing

If `client/src/api/http.ts` does not exist, create it:

- an axios instance with `baseURL: "/api"`
- a request interceptor attaching `Authorization: Bearer <token>` from
  `localStorage.getItem("cancer-hms-token")` — that exact key, it is what `AuthContext` already writes
- a response interceptor that unwraps the contract's error envelope, turning a `{ error: "..." }` body
  into `new Error(msg)`, so the existing
  `err instanceof Error ? err.message : "Something went wrong"` handling in every dialog keeps working
  unchanged. Fall back to the HTTP status text when no `error` field is present.

And add a dev proxy to `client/vite.config.ts` so relative `/api` calls reach the backend:

```ts
server: { proxy: { "/api": { target: "http://localhost:8080", changeOrigin: true } } }
```

Ask the user for the backend port if it is not 8080.

## Per module

Replace the internals only:

- `import { db, delay, nextId, persist } from "../mocks/db";` → `import { http } from "./http";`
- each function body → the corresponding `http.get/post/patch(...)` returning `res.data`
- keep the exported `*Input` aliases exactly as they are — they are part of the contract
- drop client-side sorting **only if** the contract states the server sorts (it does, for all three
  `list*` endpoints); otherwise keep it
- resolve the 404 question deliberately: the contract says `GET /api/patients/:id` and
  `GET /api/invoices/:id` return 404 on missing, while the mocks return `undefined`. Either let the error
  propagate or catch 404 → `undefined`. Whichever you choose, keep the declared return type honest and
  tell the user which you picked, since callers may render an empty state today.
- `invoiceTotal` in `billing.ts` is a local pure helper, not an endpoint — leave it and its re-export alone.

## When every module is wired

`client/src/mocks/` becomes dead code and can be deleted — but **only** once all five modules are
converted and nothing imports from it. Check with grep first, and ask the user before deleting; the mock
datastore is also what makes the app demoable without a running backend.

## Finish

Run `pnpm --filter client lint` and `pnpm --filter client exec tsc -b` (pnpm only). Then report: which
modules were converted, the 404 decision, the exact file list from `git diff --name-only`, and what still
needs a live backend to actually verify.
