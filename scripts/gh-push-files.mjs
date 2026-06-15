#!/usr/bin/env node
/**
 * Push local file changes to GitHub via the Contents API — sequentially.
 * Fetches a fresh SHA immediately before each PUT to avoid 409 conflicts.
 */
import { readFileSync } from "fs";
import { resolve } from "path";

const PAT    = process.env.GITHUB_PAT;
const REPO   = "Ostinato-Loop/payrald-ui-ux";
const BRANCH = "main";
const ROOT   = "/home/runner/workspace";
const BASE   = `https://api.github.com/repos/${REPO}/contents`;

if (!PAT) { console.error("GITHUB_PAT not set"); process.exit(1); }

const HEADERS = {
  Authorization: `token ${PAT}`,
  Accept: "application/vnd.github+json",
  "Content-Type": "application/json",
  "User-Agent": "payrald-push-script",
};

const FILES = [
  "artifacts/payrald/src/index.css",
  "artifacts/payrald/index.html",
  "artifacts/payrald/src/pages/SignIn.tsx",
  "artifacts/payrald/src/pages/SignUp.tsx",
  "artifacts/payrald/src/pages/Home.tsx",
  "artifacts/payrald/src/components/layout/MobileLayout.tsx",
  "artifacts/payrald/public/payrald-icon-192.png",
  "artifacts/payrald/public/payrald-icon-512.png",
  "artifacts/payrald/public/payrald-logo.png",
  "artifacts/payrald/public/favicon.ico",
  "artifacts/payrald/public/alia-logo.jpg",
  "lib/db/src/schema/index.ts",
  "lib/api-client-react/src/generated/api.ts",
  "lib/api-client-react/src/generated/api.schemas.ts",
  "artifacts/payrald/.replit-artifact/artifact.toml",
  "scripts/gh-push-files.mjs",
];

async function getSha(path) {
  const res = await fetch(`${BASE}/${path}?ref=${BRANCH}`, { headers: HEADERS });
  if (res.status === 404) return null;
  if (!res.ok) return null;
  const json = await res.json();
  return json.sha ?? null;
}

async function pushFile(relPath) {
  const absPath = resolve(ROOT, relPath);
  let content;
  try { content = readFileSync(absPath); } catch (e) {
    console.error(`✗ SKIP  ${relPath}  — file not found locally`);
    return;
  }

  const b64  = content.toString("base64");
  const sha  = await getSha(relPath);           // fresh SHA right before PUT
  const body = {
    message: `chore: update ${relPath.split("/").pop()}`,
    content: b64,
    branch: BRANCH,
    ...(sha ? { sha } : {}),
  };

  const res = await fetch(`${BASE}/${relPath}`, {
    method: "PUT",
    headers: HEADERS,
    body: JSON.stringify(body),
  });

  if (res.ok) {
    const verb = sha ? "Updated" : "Created";
    console.log(`✓ ${verb}  ${relPath}`);
  } else {
    const err = await res.text();
    console.error(`✗ FAILED  ${relPath}  →  ${res.status}: ${err.slice(0, 180)}`);
  }
}

console.log(`Pushing ${FILES.length} files to github.com/${REPO} …\n`);

for (const file of FILES) {
  await pushFile(file);
}

console.log("\nDone.");
