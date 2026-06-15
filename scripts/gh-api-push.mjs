#!/usr/bin/env node
/**
 * Pushes the workspace to GitHub using the Git Data API only (no git CLI).
 *
 * Safety rules:
 *   1. Secrets excluded  — real .env files are blocked; only .env.example
 *      and .env.production (which contain no secrets by convention) are allowed.
 *   2. Fail-fast         — any blob upload error aborts immediately; no silent
 *      partial state is ever committed to the remote.
 *   3. Full-mirror tree  — built without base_tree so the remote branch exactly
 *      equals the collected file set; deletions are implicit and deterministic.
 *   4. Dry-run summary   — prints files-to-push before touching the remote;
 *      pass --dry-run to stop there.
 */
import { readFileSync, readdirSync, statSync } from "fs";
import { join, relative, basename } from "path";

const OWNER  = "Ostinato-Loop";
const REPO   = "payrald-ui-ux";
const BRANCH = "main";
const ROOT   = "/home/runner/workspace";
const TOKEN  = process.env.GITHUB_PAT;
const DRY_RUN = process.argv.includes("--dry-run");

if (!TOKEN) { console.error("GITHUB_PAT not set"); process.exit(1); }

const API = "https://api.github.com";
const HDRS = {
  Authorization: `Bearer ${TOKEN}`,
  "Content-Type": "application/json",
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
  "User-Agent": "payrald-push/1.0",
};

async function api(method, path, body) {
  const res = await fetch(`${API}${path}`, {
    method, headers: HDRS,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`${method} ${path} → HTTP ${res.status}: ${JSON.stringify(data).slice(0,300)}`);
  return data;
}

// ── exclusion rules (blocklist) ────────────────────────────────────────────

// Directories pruned at any depth
const PRUNE_DIRS = new Set([
  "node_modules",  // runtime deps — installed by pnpm on the target
  ".git",          // version-control internals
  "dist",          // compiled output — not source
  ".cache",        // TS / Vite caches
  ".local",        // Replit agent state, skills, task files
]);

// Additional directories pruned at the repo root only
const PRUNE_ROOT_DIRS = new Set([
  "mockup-sandbox", // Replit Canvas preview server — not product source
]);

// File names pruned everywhere
const PRUNE_FILENAMES = new Set([
  ".tsbuildinfo",  // incremental TS compiler cache
  "artifact.toml", // Replit artifact config
  ".replit",       // Replit workspace config
]);

// File patterns that may contain real secrets — excluded by name
// Exception: .env.example and .env.production are safe (no real creds by convention)
function isSecretFile(name) {
  if (name === ".env.example" || name === ".env.production") return false;
  // Block .env, .env.local, .env.development, .env.test, etc.
  return name === ".env" || /^\.env\./.test(name);
}

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
      if (PRUNE_FILENAMES.has(entry)) continue;
      if (isSecretFile(entry)) {
        console.log(`   🔒 SECRET excluded: ${rel}`);
        continue;
      }
      acc.push({ full, rel });
    }
  }
  return acc;
}

// ── binary detection ───────────────────────────────────────────────────────
const BINARY_EXT = new Set([
  ".png",".jpg",".jpeg",".gif",".webp",".ico",
  ".woff",".woff2",".ttf",".eot",".otf",".pdf",
]);

// ── main ───────────────────────────────────────────────────────────────────
(async () => {
  console.log("📦 Collecting files...");
  const files = collectFiles(ROOT);
  console.log(`   ${files.length} files to push\n`);

  // Dry-run summary
  const byDir = {};
  for (const { rel } of files) {
    const dir = rel.split("/").slice(0, 2).join("/");
    byDir[dir] = (byDir[dir] ?? 0) + 1;
  }
  console.log("Summary by directory:");
  for (const [dir, count] of Object.entries(byDir).sort()) {
    console.log(`   ${String(count).padStart(4)}  ${dir}`);
  }
  console.log();

  if (DRY_RUN) {
    console.log("--dry-run: stopping before remote changes.");
    process.exit(0);
  }

  if (files.length < 50) {
    throw new Error(`Only ${files.length} files collected — aborting to prevent destructive push.`);
  }

  // 1. Resolve HEAD SHA — distinguish 404 from real errors
  console.log("🔍 Getting HEAD SHA...");
  let parentSha = null;
  try {
    const ref = await api("GET", `/repos/${OWNER}/${REPO}/git/refs/heads/${BRANCH}`);
    parentSha = ref.object.sha;
    console.log(`   HEAD: ${parentSha.slice(0,8)}`);
  } catch (err) {
    if (err.message.includes("HTTP 404")) {
      console.log("   Branch not found — creating fresh branch");
    } else {
      throw err; // auth / permissions / server errors bubble up
    }
  }

  // 2. Create blobs — FAIL FAST on any error (no silent skips)
  console.log(`\n📤 Uploading ${files.length} blobs...`);
  const treeEntries = [];

  for (let i = 0; i < files.length; i++) {
    const { full, rel } = files[i];
    const ext = (rel.match(/\.([^./]+)$/) ?? [])[1]?.toLowerCase();
    const isBinary = BINARY_EXT.has(`.${ext}`);

    let content, encoding;
    try {
      content  = isBinary ? readFileSync(full).toString("base64") : readFileSync(full, "utf8");
      encoding = isBinary ? "base64" : "utf-8";
    } catch (err) {
      throw new Error(`Cannot read ${rel}: ${err.message}`);
    }

    let blob;
    try {
      blob = await api("POST", `/repos/${OWNER}/${REPO}/git/blobs`, { content, encoding });
    } catch (err) {
      throw new Error(`Blob upload failed for ${rel}: ${err.message}`);
    }

    treeEntries.push({ path: rel, mode: "100644", type: "blob", sha: blob.sha });
    if ((i + 1) % 30 === 0) process.stdout.write(`   ${i + 1}/${files.length}...\n`);
  }
  console.log(`   ✓ ${treeEntries.length} blobs uploaded`);

  // 3. Full-mirror tree (no base_tree)
  console.log("\n🌳 Creating full-mirror tree...");
  const tree = await api("POST", `/repos/${OWNER}/${REPO}/git/trees`, { tree: treeEntries });
  console.log(`   tree: ${tree.sha.slice(0,8)}`);

  // 4. Commit
  console.log("\n💾 Creating commit...");
  const commit = await api("POST", `/repos/${OWNER}/${REPO}/git/commits`, {
    message: `feat: PayRald Phase 1 — ALIA-powered consumer finance layer

Part of the RALD ecosystem:
  RALD ID → ALIA → PayRald (consumer)
                 → Merchant / Institutions / Government / Routing

Phase 1 scope:
- Send: peer-to-peer transfers via @username, email, or phone (ALIA resolves)
- Pay: merchant payments via @merchant handle
- Withdraw: GTBank / Wema / NIP bank withdrawals — no account numbers exposed
- Auth: RALD ID + PIN, token stored as payrald_token in localStorage
- API: Express + Drizzle ORM + PostgreSQL at api.pay.rald.cloud
- Frontend: React + Vite, dark PayRald brand, mobile-first at pay.rald.cloud
- CORS locked to rald.cloud in production
- Zero Replit-specific code or dependencies`,
    tree: tree.sha,
    author: { name: "PayRald", email: "payrald@rald.cloud", date: new Date().toISOString() },
    parents: parentSha ? [parentSha] : [],
  });
  console.log(`   commit: ${commit.sha.slice(0,8)}`);

  // 5. Update ref (force)
  console.log("\n🚀 Updating ref...");
  if (parentSha) {
    await api("PATCH", `/repos/${OWNER}/${REPO}/git/refs/heads/${BRANCH}`, {
      sha: commit.sha, force: true,
    });
  } else {
    await api("POST", `/repos/${OWNER}/${REPO}/git/refs`, {
      ref: `refs/heads/${BRANCH}`, sha: commit.sha,
    });
  }

  console.log(`\n✅ Pushed ${treeEntries.length} files → https://github.com/${OWNER}/${REPO}/tree/${BRANCH}`);
  console.log(`   Commit: ${commit.sha}`);
})().catch(err => { console.error("\n❌", err.message); process.exit(1); });
