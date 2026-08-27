---
description: Generate Java/Spring Boot stubs and a briefing for the backend developer from API_CONTRACT.md
allowed-tools: Agent, Read, Write, Grep, Glob
---

Produce hand-off material for the developer building the Java/Spring Boot backend in a separate repo.

Do this in two steps:

1. **Audit first.** Run the `contract-auditor` agent so the hand-off does not propagate known drift. If
   it reports BREAKING findings, surface them to the user before generating stubs — shipping stubs built
   on a broken contract wastes the other developer's time.

2. **Generate.** Run the `spring-stub-writer` agent, which writes record DTOs, enums, controller
   interfaces with `@PreAuthorize`, a role matrix, and a README into `docs/backend-stubs/`.

Constraint the writer must respect and you must verify afterwards: output goes **only** to
`docs/backend-stubs/`. No `server/` directory, no Java on a build path, no changes under `client/` or to
`package.json` / `pnpm-workspace.yaml`. `CLAUDE.md` is explicit that no backend is scaffolded in this
repo — these are documents that happen to be valid Java. Check with `git status` before reporting done.

Then write a short briefing to the user covering:

- **Auth** — `Authorization: Bearer <token>`; `POST /api/auth/login` → `{ token, user }`;
  `GET /api/auth/me` → `User`; 401 on bad or expired; never return a password field.
- **Error envelope** — `{ "error": "<human-readable>" }` on all 4xx/5xx; the frontend renders it directly
  in form UI, so the message is user-facing copy.
- **Casing** — camelCase on the wire, exactly as in the contract. No Jackson snake_case strategy.
- **Sort orders** — patients newest-registered first, invoices newest-issued first, appointments by
  `scheduledAt` ascending. Server-enforced.
- **Server-set values** — appointment `status` defaults to `SCHEDULED`; invoice `status` defaults to
  `UNPAID` with `issuedAt` set server-side; `unitPrice` is `BigDecimal`.
- **Role matrix** — which endpoints are restricted, plus the endpoints where the contract is silent and a
  decision is needed. Silence is a gap, not permission.
- **Open questions** — everything the audit flagged, especially the 404-vs-`undefined` mismatch on
  `GET /api/patients/:id` and `GET /api/invoices/:id`.

Report the files written and the endpoint coverage against the 23 endpoints in the contract. Do not claim
coverage that was not produced.

$ARGUMENTS
