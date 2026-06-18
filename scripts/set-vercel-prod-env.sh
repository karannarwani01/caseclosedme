#!/usr/bin/env bash
#
# One-shot: push all PRODUCTION env vars to the caseclosed Vercel project.
#
# Prereqs (run once, in this order):
#   npm i -g vercel                 # if not installed
#   vercel login                    # sign in as agnnanigirish@gmail.com
#   vercel link                     # pick the caseclosed project
#   # ensure .env.local (with the real secret values) is in this folder
#
# Then edit PROD_ORIGIN below and run:   bash scripts/set-vercel-prod-env.sh
#
# Re-runnable: removes an existing prod value before adding, so it updates in
# place. Secret values are read from .env.local and never printed.

set -eu
cd "$(dirname "$0")/.."

# >>> EDIT to the live production URL (custom domain once DNS is cut over, or the
#     *.vercel.app URL until then). No trailing slash. <<<
PROD_ORIGIN="https://caseclosedme.com"

ENV_FILE=".env.local"
[ -f "$ENV_FILE" ] || { echo "ERROR: $ENV_FILE not found (need the real values)"; exit 1; }

set_var () {
  key="$1"; val="$2"
  [ -z "$val" ] && { echo "skip   $key (empty)"; return; }
  vercel env rm "$key" production -y >/dev/null 2>&1 || true   # idempotent
  printf '%s' "$val" | vercel env add "$key" production >/dev/null
  echo "set    $key"
}

# Push everything populated in .env.local, applying prod overrides inline.
while IFS='=' read -r key val; do
  case "$key" in ''|\#*) continue;; esac
  val="${val%\"}"; val="${val#\"}"                 # strip surrounding quotes
  case "$key" in
    APP_ORIGIN|NEXT_PUBLIC_APP_ORIGIN) val="$PROD_ORIGIN";;
    USE_DEMO_PRODUCTS) val="false";;
  esac
  set_var "$key" "$val"
done < "$ENV_FILE"

# Ensure prod-only overrides exist even if absent from .env.local.
grep -q '^APP_ORIGIN='             "$ENV_FILE" || set_var APP_ORIGIN             "$PROD_ORIGIN"
grep -q '^NEXT_PUBLIC_APP_ORIGIN=' "$ENV_FILE" || set_var NEXT_PUBLIC_APP_ORIGIN "$PROD_ORIGIN"
grep -q '^USE_DEMO_PRODUCTS='      "$ENV_FILE" || set_var USE_DEMO_PRODUCTS      "false"

echo
echo "Done. Verify:  vercel env ls production"
echo "Redeploy:      vercel --prod"
