#!/usr/bin/env node
// Blocks a commit when staged files contain secrets (owner, 2026-11-19). Runs from .githooks/pre-commit.
// Prints only file names and the kind of secret, never the value. Also refuses env files and data/.
import { execSync } from 'node:child_process';
import { readFileSync, statSync } from 'node:fs';

const PAT = {
  'Google API key': /AIza[0-9A-Za-z_\-]{35}/,
  'Groq key': /gsk_[0-9A-Za-z]{20,}/,
  'OpenAI-style key': /\bsk-[A-Za-z0-9_\-]{20,}/,
  'Resend key': /\bre_[A-Za-z0-9]{8,}_[A-Za-z0-9]{8,}/,
  'Supabase secret key': /sb_secret_[A-Za-z0-9_\-]{10,}/,
  'Supabase account token': /sbp_[0-9a-f]{20,}/,
  'GitHub token': /\bgh[pousr]_[A-Za-z0-9]{30,}/,
  'Stripe key': /\b(sk|rk)_(live|test)_[0-9A-Za-z]{10,}/,
  'Vercel token': /\bvercel_[A-Za-z0-9]{20,}/,
  'JWT': /eyJ[A-Za-z0-9_\-]{10,}\.eyJ[A-Za-z0-9_\-]{10,}\./,
  'Private key': /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
};
const files = execSync('git diff --cached --name-only --diff-filter=ACMR', { encoding: 'utf8' }).split('\n').filter(Boolean);
const bad = [];
for (const f of files) {
  if (/(^|\/)\.env(\..*)?$/.test(f) && !f.endsWith('.env.example')) { bad.push(`${f}: environment file`); continue; }
  if (/^data\//.test(f) && f !== 'data/.gitkeep') { bad.push(`${f}: runtime data (personal data)`); continue; }
  let text = '';
  try { if (statSync(f).size > 3_000_000) continue; text = readFileSync(f, 'utf8'); } catch { continue; }
  for (const [kind, rx] of Object.entries(PAT)) if (rx.test(text)) bad.push(`${f}: ${kind}`);
}
if (bad.length) {
  console.error('\n✋ Commit blocked: possible secret in staged files (values not shown):\n  ' + bad.join('\n  ') + '\nRemove it (keep secrets only in .env), then commit again.\n');
  process.exit(1);
}
