#!/usr/bin/env node
// PostToolUse hook: run oxlint on the single file that was just written or edited.
// Errors  -> exit 2, output fed back so they get fixed in the same turn.
// Warnings -> exit 0 with the output as context.
// oxlint missing, file outside client/src, or anything unexpected -> exit 0 silently.

import { readFileSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { relative, resolve, isAbsolute, dirname } from "node:path";
import { fileURLToPath } from "node:url";

let payload;
try {
  payload = JSON.parse(readFileSync(0, "utf8"));
} catch {
  process.exit(0);
}

const WRITE_TOOLS = new Set(["Write", "Edit", "MultiEdit"]);
if (!WRITE_TOOLS.has(payload.tool_name ?? "")) process.exit(0);

const filePath = String(payload.tool_input?.file_path ?? "");
if (!/\.(js|jsx)$/i.test(filePath)) process.exit(0);

// Derive the project root from this script's own location (.claude/hooks/ -> repo root) rather than
// from cwd or an env var: a Git Bash cwd arrives as /c/Users/... which node on Windows resolves wrongly.
const selfRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const projectDir = existsSync(resolve(selfRoot, "client", "package.json"))
  ? selfRoot
  : process.env.CLAUDE_PROJECT_DIR || payload.cwd || process.cwd();

const clientDir = resolve(projectDir, "client");
const abs = isAbsolute(filePath) ? filePath : resolve(projectDir, filePath);

// oxlint resolves client/.oxlintrc.json from its cwd, so run it from client/ with a relative path.
const rel = relative(clientDir, abs).replace(/\\/g, "/");
if (rel.startsWith("..") || !rel.startsWith("src/")) process.exit(0);

const result = spawnSync(`pnpm --filter client exec oxlint "${rel}"`, {
  cwd: projectDir,
  shell: true,
  encoding: "utf8",
  timeout: 45_000,
});

if (result.error || result.status === null) process.exit(0); // not installed / timed out

const raw = `${result.stdout ?? ""}\n${result.stderr ?? ""}`;

// Keep only oxlint's own output. pnpm wraps a failing command in its own noise
// (ERR_PNPM_RECURSIVE_EXEC_FIRST_FAIL, a stray "undefined" line, the package path),
// which must NOT be mistaken for "oxlint isn't available" -- it is what a real lint error looks like.
const DIAGNOSTIC = /^\s*\S+:\d+:\d+:\s+(error|warning)\b/;
const lines = raw.split(/\r?\n/).filter((line) => DIAGNOSTIC.test(line) || /^Found \d+/.test(line.trim()));
const report = lines.join("\n").trim();

if (!report) {
  // Nothing oxlint-shaped came back: either a clean file or the toolchain is unavailable.
  // Either way there is nothing useful to say, so stay quiet instead of nagging on every edit.
  process.exit(0);
}

if (lines.some((line) => /:\s+error\b/.test(line))) {
  process.stderr.write(`oxlint errors in ${rel}:\n\n${report}\n`);
  process.exit(2);
}

process.stdout.write(
  JSON.stringify({
    hookSpecificOutput: {
      hookEventName: "PostToolUse",
      additionalContext: `oxlint warnings in ${rel} (not blocking):\n${report}`,
    },
  })
);

process.exit(0);
