#!/bin/sh
# Pushes every setting from .env to the Vercel project as a Sensitive variable (Production + Preview).
# Values go straight from this computer to Vercel: nothing is printed, nothing passes through chat or Git.
# Usage (once, in your own Terminal):  npx vercel@latest login   then   sh scripts/vercel-env-push.sh
set -e
cd "$(dirname "$0")/.."
[ -f .env ] || { echo "No .env file found."; exit 1; }
VC="npx --yes vercel@latest"
$VC link --yes --project chioutworks-website --scope chioutworks >/dev/null
n=0
while IFS= read -r line || [ -n "$line" ]; do
  case "$line" in ''|\#*) continue ;; esac
  key=${line%%=*}; val=${line#*=}
  case "$key" in *[!A-Z0-9_]*|'') continue ;; esac
  [ -z "$val" ] && { echo "skipped (empty): $key"; continue; }
  for env in production preview; do
    $VC env rm "$key" "$env" --yes >/dev/null 2>&1 || true
    printf '%s' "$val" | $VC env add "$key" "$env" --sensitive >/dev/null
  done
  n=$((n+1)); echo "added: $key (production + preview, sensitive)"
done < .env
echo "Done: $n settings. Values were not shown."
