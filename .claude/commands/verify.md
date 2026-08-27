---
description: Run the full local verification gate — oxlint, TypeScript build, and the Vite production build
allowed-tools: Bash, Read, Grep, Glob, Edit
---

Run the verification gate for this repo, in order, stopping at the first failure:

1. `pnpm --filter client lint`
2. `pnpm --filter client exec tsc -b`
3. `pnpm --filter client build`

**pnpm only** — never `npm` or `yarn` (see `CLAUDE.md`).

There is no test runner and no formatter in this repo; these three commands are the entire gate. Do not
invent a `pnpm test` step.

If everything passes, report it in one line.

If something fails:
- Report each failure as `path:line — message`, using clickable relative paths.
- Fix failures that are clearly mechanical (unused import or local — `noUnusedLocals` and
  `noUnusedParameters` are on; a missing `import type` — `verbatimModuleSyntax` is on; a type error in
  code just written). Re-run the gate after fixing.
- Do **not** silence a failure with `any`, a `// oxlint-disable` comment, or by loosening `tsconfig`.
  If a failure looks like a real design problem, stop and explain it instead of working around it.

Step 3 is a superset of step 2 (`build` is `tsc -b && vite build`), so if step 2 fails there is no point
running step 3 — fix and restart from step 1.

$ARGUMENTS
