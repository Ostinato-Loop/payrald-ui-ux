#!/usr/bin/env node
/**
 * Pushes the full workspace to GitHub using the Git Data API only.
 * No git CLI — pure HTTPS via fetch().
 *
 * Strategy:
 *   - Blocklist approach: include everything EXCEPT explicit non-source dirs/files.
 *   - Tree built WITHOUT base_tree → full mirror; anything not in this set is
 *     removed from the remote branch, making deletions explicit and safe.
 *   - HTTP 404 on branch lookup is handled separately from auth/server errors.
 */
import { readFileSync, readdirSync, statSync } from "fs";
import { join, relative } from "path";

const OWNER  = "Ostinato-Loop";
const REPO   = "payrald-ui-ux";
const BRANCH = "main";
const ROOT   = "/home/runner/workspace";
const TOKEN  = process.env.GITHUB_PAT;

if (!TOKEN) { console.error("GITHUB_PAT not set"); process.exit(1); }

const API = "https://api.github.com";
const headers = {
  Authorization: `Bearer ${TOKEN}`,
  "Content-Type": "application/json",
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
  "User-Agent": "payrald-push/1.0",
};

async function api(method, path, body) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(`${method} ${path} → HTTP ${res.status}: ${JSON.stringify(data).slice(0, 300)}`);
  }
  return data;
}

// ── blocklist: directories that must never be pushed ──────────────────────
// These are either build artefacts, runtime deps, or Replit-internal.
const PRUNE_DIRS = new Set([
  "node_modules",   // runtime deps — installed via pnpm on the target
  ".git",           // git internals
  "dist",           // build output — not source
  ".cache",         // TypeScript / vite caches
  ".local",         // Replit agent state, skills, task files — not source
]);

// Directory names that should be skipped only at the repo root level
const PRUNE_ROOT_DIRS = new Set([
  "mockup-sandbox", // Replit Canvas preview server — not part of product source
]);

// Specific file names to exclude everywhere
const PRUNE_FILES = new Set([
  ".tsbuildinfo",   // incremental TS compiler cache
  "artifact.toml",  // Replit artifact config — not product source
  ".replit",        // Replit workspace config
]);

// ── file collection ────────────────────────────────────────────────────────
function collectFiles(dir, depth = 0, acc = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const rel  = relative(ROOT, full);

    let stat;
    try { stat = statSync(full); } catch { continue; }

    if (stat.isDirectory()) {
      if (PRUNE_DIRS.has(entry)) continue;
      if (depth === 0 && PRUNE_ROOT_DIRS.has(entry)) continue;
      collectFiles(full, depth + 1, acc);
    } else {
      if (PRUNE_FILES.has(entry)) continue;
      acc.push({ full, rel });
    }
  }
  return acc;
}

// ── binary detection ───────────────────────────────────────────────────────
const BINARY_EXT = new Set([
  ".png", ".jpg", ".jpeg", ".gif", ".webp", ".ico",
  ".woff", ".woff2", ".ttf", ".eot", ".otf", ".pdf",
]);

// ── main ───────────────────────────────────────────────────────────────────
(async () => {
  console.log("📦 Collecting files...");
  const files = collectFiles(ROOT);
  console.log(`   Found ${files.length} files`);

  // 1. Resolve HEAD SHA — distinguish 404 (branch missing) from real errors
  console.log("\n🔍 Getting HEAD SHA...");
  let parentSha = null;
  try {
    const ref = await api("GET", `/repos/${OWNER}/${REPO}/git/refs/heads/${BRANCH}`);
    parentSha = ref.object.sha;
    console.log(`   HEAD: ${parentSha.slice(0, 8)}`);
  } catch (err) {
    if (err.message.includes("HTTP 404")) {
      console.log("   Branch not found — will create fresh");
    } else {
      throw err; // auth / permissions / server errors bubble up
    }
  }

  // 2. Create blobs for every collected file
  console.log("\n📤 Creating blobs...");
  const treeEntries = [];
  let done = 0;
  let skipped = 0;

  for (const { full, rel } of files) {
    const extMatch = rel.match(/\.([^./]+)$/);
    const ext      = extMatch ? `.${extMatch[1].toLowerCase()}` : "";
    const isBinary = BINARY_EXT.has(ext);
    let content, encoding;

    try {
      content  = isBinary
        ? readFileSync(full).toString("base64")
        : readFileSync(full, "utf8");
      encoding = isBinary ? "base64" : "utf-8";
    } catch {
      console.warn(`   SKIP (unreadable): ${rel}`);
      skipped++;
      continue;
    }

    try {
      const blob = await api("POST", `/repos/${OWNER}/${REPO}/git/blobs`, { content, encoding });
      treeEntries.push({ path: rel, mode: "100644", type: "blob", sha: blob.sha });
      done++;
      if (done % 25 === 0) process.stdout.write(`   ${done}/${files.length}...\n`);
    } catch (err) {
      console.warn(`   SKIP (blob error): ${rel}: ${err.message.slice(0, 80)}`);
      skipped++;
    }
  }
  console.log(`   ✓ ${done} blobs uploaded  ✗ ${skipped} skipped`);

  // Pre-push sanity check: make sure we have a reasonable file count
  if (done < 50) {
    throw new Error(`Suspiciously few files (${done}). Aborting to avoid destructive push.`);
  }

  // 3. Create tree from scratch — no base_tree means full mirror;
  //    any file present on remote but absent here is implicitly deleted.
  console.log("\n🌳 Creating full-mirror tree (no base_tree)...");
  const tree = await api("POST", `/repos/${OWNER}/${REPO}/git/trees`, { tree: treeEntries });
  console.log(`   tree SHA: ${tree.sha.slice(0, 8)}`);

  // 4. Create commit
  console.log("\n💾 Creating commit...");
  const commitBody = {
    message: `feat: PayRald Phase 1 — ALIA-powered consumer finance layer

Part of the RALD ecosystem:
  RALD ID → ALIA → PayRald (consumer)
                 → Merchant / Institutions / Government / Routing

Phase 1 scope:
- Send: peer-to-peer transfers via @username, email, or phone (ALIA resolves)
- Pay: merchant payments via @merchant handle
- Withdraw: GTBank / Wema / NIP bank withdrawals — no account numbers exposed
- Auth: RALD ID + PIN login, token in localStorage as payrald_token
- API: Express + Drizzle ORM + PostgreSQL at api.pay.rald.cloud
- Frontend: React + Vite, dark PayRald brand, mobile-first at pay.rald.cloud
- CORS: locked to rald.cloud in production
- Zero Replit-specific code or dependencies`,
    tree: tree.sha,
    author: {
      name: "PayRald",
      email: "payrald@rald.cloud",
      date: new Date().toISOString(),
    },
    parents: parentSha ? [parentSha] : [],
  };
  const commit = await api("POST", `/repos/${OWNER}/${REPO}/git/commits`, commitBody);
  console.log(`   commit SHA: ${commit.sha.slice(0, 8)}`);

  // 5. Update (or create) ref — force-push
  console.log("\n🚀 Updating ref...");
  if (parentSha) {
    await api("PATCH", `/repos/${OWNER}/${REPO}/git/refs/heads/${BRANCH}`, {
      sha: commit.sha,
      force: true,
    });
  } else {
    await api("POST", `/repos/${OWNER}/${REPO}/git/refs`, {
      ref: `refs/heads/${BRANCH}`,
      sha: commit.sha,
    });
  }

  console.log(`\n✅ Pushed ${done} files → https://github.com/${OWNER}/${REPO}/tree/${BRANCH}`);
  console.log(`   Commit: ${commit.sha}`);
})();
