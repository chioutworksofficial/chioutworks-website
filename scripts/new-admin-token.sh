#!/bin/sh
# Generates a new strong ADMIN_TOKEN, writes it to .env (chmod 600) and pushes it to Vercel (production + preview, sensitive).
# The value is never printed. Open .env once to read it, then store it in your password manager.
# Usage (own Terminal, after `npx vercel@latest login`):  sh scripts/new-admin-token.sh
set -e
cd "$(dirname "$0")/.."
[ -f .env ] || { echo "No .env file found."; exit 1; }
command -v openssl >/dev/null || { echo "openssl is required."; exit 1; }
tok=$(openssl rand -base64 48 | tr -d '\n=+/' | cut -c1-48)
umask 077
tmp=$(mktemp .env.XXXXXX)
grep -v '^ADMIN_TOKEN=' .env > "$tmp" || true
printf 'ADMIN_TOKEN=%s\n' "$tok" >> "$tmp"
mv "$tmp" .env; chmod 600 .env
VC="npx --yes vercel@latest"
$VC link --yes --project chioutworks-website --scope chioutworks >/dev/null
for env in production preview; do
  $VC env rm ADMIN_TOKEN "$env" --yes >/dev/null 2>&1 || true
  printf '%s' "$tok" | $VC env add ADMIN_TOKEN "$env" --sensitive >/dev/null
done
unset tok
echo "New ADMIN_TOKEN saved to .env and Vercel (production + preview). Open .env to read it once. Redeploy so it takes effect."
