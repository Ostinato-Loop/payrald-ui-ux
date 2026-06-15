#!/usr/bin/env node
import { execSync } from "child_process";

const pat = process.env.GITHUB_PAT;
if (!pat) {
  console.error("GITHUB_PAT not set");
  process.exit(1);
}

const repo = "Ostinato-Loop/payrald-ui-ux";
const remote = `https://${pat}@github.com/${repo}.git`;

const run = (cmd, opts = {}) => {
  console.log(`> ${cmd.replace(pat, "***")}`);
  return execSync(cmd, { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"], ...opts });
};

try {
  // Configure git identity for the commit
  run(`git config user.email "payrald@rald.cloud"`);
  run(`git config user.name "PayRald"`);

  // Stage everything
  run(`git add -A`);

  // Check if there's anything to commit
  const status = run(`git status --porcelain`).trim();
  if (status) {
    console.log("Staged changes:\n" + status);
    run(`git commit -m "feat: PayRald Phase 1 — ALIA-powered transfers, payments, withdrawals on rald.cloud

- Frontend: React + Vite, dark PayRald brand, mobile-first
- Auth: RALD ID + PIN via ALIA identity
- Send: peer-to-peer transfers (@username / email / phone)
- Pay: merchant payments via @merchant handle
- Withdraw: GTBank/Wema/NIP bank withdrawals, no account numbers exposed
- API: Express + Drizzle ORM + PostgreSQL
- Production domains: pay.rald.cloud + api.pay.rald.cloud
- CORS locked to rald.cloud in production
- Vite proxy for local dev, zero Replit dependencies in source"`);
    console.log("Committed.");
  } else {
    console.log("Nothing to commit — working tree clean.");
  }

  // Add/update remote
  try {
    run(`git remote add github "${remote}"`);
  } catch {
    run(`git remote set-url github "${remote}"`);
  }

  // Push
  const logHead = run(`git log --oneline -1`).trim();
  console.log(`Pushing: ${logHead}`);
  run(`git push github HEAD:main --force`);
  console.log(`\n✓ Pushed to https://github.com/${repo}`);
} catch (err) {
  console.error("Push failed:", err.message);
  process.exit(1);
}
