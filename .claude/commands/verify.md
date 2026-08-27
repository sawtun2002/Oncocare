---
description: Run the full local verification gate — oxlint and the Vite production build
allowed-tools: Bash, Read, Grep, Glob, Edit
---

Run the verification gate for this repo, in order, stopping at the first failure:

1. `pnpm --filter client lint`
2. `pnpm --filter client build`

**pnpm only** — never `npm` or `yarn` (see `CLAUDE.md`).

There is no test runner, no formatter and **no type-check** in this repo — `client/` is plain
JavaScript, `client/jsconfig.json` sets `checkJs: false` and no command reads it. These two commands are
the entire gate. Do not invent a `pnpm test` step and do not add `tsc -b`; it would fail, there is no
`tsconfig.json` and TypeScript is not installed.

If everything passes, report it in one line.

Note the expected baseline: `lint` currently emits three `only-export-components` warnings (one per
file in `client/src/context/`, each of which exports a provider component *and* its hook — deliberate)
and one `set-state-in-effect` warning in `AuthContext.jsx`. Warnings do not fail the gate. Report new
ones; don't report these as findings unless the count changed.

If something fails:
- Report each failure as `path:line — message`, using clickable relative paths.
- Fix failures that are clearly mechanical (an unused import or local, a typo in code just written).
  Re-run the gate after fixing.
- Do **not** silence a failure with a `// oxlint-disable` comment or by loosening `.oxlintrc.json`.
  If a failure looks like a real design problem, stop and explain it instead of working around it.

$ARGUMENTS
