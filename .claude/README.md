# `.claude/` — Claude Code configuration

Committed to the repo so everyone working on OncoCare gets the same guardrails and commands.
`settings.local.json` (personal permission grants) is gitignored.

## Commands

| Command | What it does |
|---|---|
| `/verify` | The local gate: `pnpm --filter client lint`, `pnpm --filter client build`. No type-check — `client/` is plain JS. |
| `/contract-check [resource]` | Audits `API_CONTRACT.md` against the types, api modules and role gating. Reports only, never edits. |
| `/new-slice <Resource>` | Scaffolds a full resource slice across all eight touch points, contract section included. |
| `/wire-api <resource\|all>` | The merge step: swaps an `api/*.js` module from the mock datastore to axios. |
| `/backend-handoff` | Generates Java/Spring stubs + a briefing into `docs/backend-stubs/`. |

## Agents

- `contract-auditor` — read-only parity check: `API_CONTRACT.md` ↔ the `@typedef`s in `types/index.js` ↔ `api/*.js`.
- `role-gating-auditor` — read-only RBAC check across nav, route guards, page conditionals and the contract.
- `spring-stub-writer` — generates the backend hand-off material.

## Skills

Loaded automatically when relevant: `hms-frontend-conventions`, `api-contract-sync`, `role-gating`,
`spring-contract-export`.

## Hooks

| Script | Event | Behaviour |
|---|---|---|
| `hooks/guard.mjs` | PreToolUse | **Blocks**: `npm`/`yarn` commands (pnpm-only repo); writing `package-lock.json` / `yarn.lock`; JS/TS files under `server/`; a `mocks/` import inside `pages/`, `components/` or `context/`. `npx` is unaffected. |
| `hooks/lint-file.mjs` | PostToolUse | Runs oxlint on the single edited `client/src/**/*.{js,jsx}` file. Errors block (exit 2) so they're fixed in-turn; warnings are surfaced but don't block. |
| `hooks/contract-reminder.mjs` | PostToolUse | After editing `api/*.js` or `types/index.js`, reminds once per file per session that `API_CONTRACT.md` may need the same change. Never blocks. |

All three read the hook JSON payload on stdin, exit 0 on anything they don't recognise, and fail open on
malformed input — a hook must never break the session.

### Notes for maintainers

- The hook commands use a path relative to the project directory (`node .claude/hooks/guard.mjs`), which
  works under both POSIX shells and `cmd.exe`. `$CLAUDE_PROJECT_DIR` would not expand on Windows.
- `lint-file.mjs` resolves the repo root from its **own** location, not from `cwd`, because a Git Bash
  cwd arrives as `/c/Users/...` which Node on Windows resolves incorrectly.
- Hooks are snapshotted at session start; after editing them, restart Claude Code.
- To test a hook without the harness, pipe a payload built with `JSON.stringify` — hand-written JSON in a
  shell heredoc mangles Windows path escapes and the hook will (correctly) fail open, which looks like a
  bug but isn't:
  ```bash
  node -e 'console.log(JSON.stringify({tool_name:"Bash",tool_input:{command:"npm install"}}))' \
    | node .claude/hooks/guard.mjs; echo "exit=$?"   # expect 2
  ```
