# `client/`

The OncoCare frontend: React 19 + Vite + Tailwind CSS v4, in plain JavaScript/JSX, running against an
in-browser mock API until the Spring Boot backend exists.

```bash
pnpm --filter client dev       # vite dev server on :5173
pnpm --filter client lint      # oxlint
pnpm --filter client build     # vite build
```

There is no type-check step and no test runner — `lint` and `build` are the whole gate. `jsconfig.json`
is for editor intellisense only (`checkJs: false`); nothing in the build reads it.

Everything else lives at the repo root: [`../README.md`](../README.md) for setup and demo logins,
[`../API_CONTRACT.md`](../API_CONTRACT.md) for the REST contract the backend must implement, and
[`../CLAUDE.md`](../CLAUDE.md) for the architecture and the conventions this code follows.
