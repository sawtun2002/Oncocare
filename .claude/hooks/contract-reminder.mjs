#!/usr/bin/env node
// PostToolUse hook: after an edit to client/src/api/*.ts or client/src/types/index.ts,
// remind that API_CONTRACT.md is the source of truth the Java backend is built against.
// Non-blocking, and fires at most once per file per session.

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

let payload;
try {
  payload = JSON.parse(readFileSync(0, "utf8"));
} catch {
  process.exit(0);
}

const WRITE_TOOLS = new Set(["Write", "Edit", "MultiEdit"]);
if (!WRITE_TOOLS.has(payload.tool_name ?? "")) process.exit(0);

const posix = String(payload.tool_input?.file_path ?? "").replace(/\\/g, "/");
if (!posix) process.exit(0);

const isApiModule = /client\/src\/api\/[^/]+\.ts$/.test(posix) && !/\/http\.ts$/.test(posix);
const isTypes = /client\/src\/types\/index\.ts$/.test(posix);
if (!isApiModule && !isTypes) process.exit(0);

// Once per file per session.
const sessionId = String(payload.session_id ?? "nosession").replace(/[^\w-]/g, "");
const key = posix.replace(/[^\w]/g, "_");
const markerDir = join(tmpdir(), "cancer-hms-hooks");
const marker = join(markerDir, `${sessionId}.${key}`);
try {
  if (existsSync(marker)) process.exit(0);
  mkdirSync(markerDir, { recursive: true });
  writeFileSync(marker, "");
} catch {
  // If the marker can't be written the reminder just repeats -- harmless.
}

const what = isTypes ? "an entity type" : "an api module";
const context =
  `You just edited ${posix} (${what}).\n\n` +
  "API_CONTRACT.md is the source of truth a separate developer is building the Java/Spring Boot backend " +
  "against — drift surfaces at merge time, in their repo, not here.\n\n" +
  "If this change touched an exported signature, a field name, casing, optionality, a union value, a " +
  "return type, or a sort order, update API_CONTRACT.md in the same change. If it was purely internal " +
  "(mock logic, formatting, a local helper), no contract edit is needed.\n\n" +
  "Run /contract-check to verify parity.";

process.stdout.write(
  JSON.stringify({
    hookSpecificOutput: { hookEventName: "PostToolUse", additionalContext: context },
  })
);
process.exit(0);
