#!/usr/bin/env node
// PreToolUse guard for the Cancer HMS repo.
// Blocks (exit 2) the mistakes CLAUDE.md warns about:
//   1. npm / yarn usage         -> this repo is pnpm-only
//   2. package-lock.json / yarn.lock writes
//   3. a JS/TS backend under server/
//   4. a mocks/ import inside client/src/pages or client/src/components
// Anything unrecognised exits 0. A hook must never break the session.

import { readFileSync } from "node:fs";

/** @returns {string} */
function readStdin() {
  try {
    return readFileSync(0, "utf8");
  } catch {
    return "";
  }
}

function block(reason) {
  process.stderr.write(reason + "\n");
  process.exit(2);
}

const raw = readStdin();
let payload;
try {
  payload = JSON.parse(raw);
} catch {
  process.exit(0);
}

const toolName = payload.tool_name ?? "";
const input = payload.tool_input ?? {};

// ---------------------------------------------------------------- 1. pnpm only
if (toolName === "Bash") {
  const command = String(input.command ?? "");
  // \bnpm\b does not match inside "pnpm" (no word boundary after the leading p),
  // and does not match "npx", which stays allowed -- `npx tsc -b` is documented in CLAUDE.md.
  if (/\bnpm\b/.test(command)) {
    block(
      "Blocked: this repo is pnpm-only (see CLAUDE.md). Use `pnpm ...` instead of `npm ...`.\n" +
        "  pnpm install | pnpm --filter client dev | pnpm --filter client lint | pnpm --filter client build\n" +
        "  (`npx tsc -b` is fine; only npm itself is blocked.)"
    );
  }
  if (/\byarn\b/.test(command)) {
    block("Blocked: this repo is pnpm-only (see CLAUDE.md). Use `pnpm ...` instead of `yarn ...`.");
  }
  process.exit(0);
}

// -------------------------------------------------------- file-writing tools
const WRITE_TOOLS = new Set(["Write", "Edit", "MultiEdit", "NotebookEdit"]);
if (!WRITE_TOOLS.has(toolName)) process.exit(0);

const filePath = String(input.file_path ?? input.notebook_path ?? "");
if (!filePath) process.exit(0);

const posix = filePath.replace(/\\/g, "/");
const lower = posix.toLowerCase();
const base = lower.split("/").pop() ?? "";

// ------------------------------------------------------------ 2. lockfiles
if (base === "package-lock.json" || base === "yarn.lock") {
  block(
    `Blocked: refusing to create ${base}. This repo uses pnpm workspaces; the only lockfile is pnpm-lock.yaml (CLAUDE.md).`
  );
}

// -------------------------------------------------- 3. no JS backend in-repo
if (/(^|\/)server\//.test(lower) && /\.(js|mjs|cjs|ts|tsx|json)$/.test(lower)) {
  block(
    "Blocked: no JS/TS backend belongs in this repo. The backend is built separately in Java + Spring Boot +\n" +
      "Maven by a different developer; a Node/Express/Prisma backend was tried here and explicitly reverted (CLAUDE.md).\n" +
      "Backend hand-off material goes in docs/backend-stubs/ instead -- see the /backend-handoff command."
  );
}

// ------------------------------- 4. mocks/ must not leak into pages/components
const inUiLayer =
  /(^|\/)client\/src\/(pages|components|context)\//.test(lower) ||
  /(^|\/)client\/src\/(app|main)\.jsx$/.test(lower);

if (inUiLayer) {
  const candidates = [];
  if (typeof input.content === "string") candidates.push(input.content);
  if (typeof input.new_string === "string") candidates.push(input.new_string);
  if (Array.isArray(input.edits)) {
    for (const edit of input.edits) {
      if (edit && typeof edit.new_string === "string") candidates.push(edit.new_string);
    }
  }
  const mocksImport = /(?:from|import|require\()\s*["'][^"']*\/mocks\/[^"']*["']/;
  if (candidates.some((text) => mocksImport.test(text))) {
    block(
      "Blocked: pages, components and context must never import from client/src/mocks/.\n" +
        "Only client/src/api/*.js may touch the mock datastore -- that boundary is what makes the real\n" +
        "Spring Boot backend a one-directory swap (CLAUDE.md, API_CONTRACT.md). Add or use an api/ function instead."
    );
  }
}

process.exit(0);
