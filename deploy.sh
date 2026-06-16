#!/usr/bin/env bash
# deploy.sh - one-command deploy for kbazar24-platform
#
# Usage:
#   ./deploy.sh                         # deploys with an auto-generated commit
#   ./deploy.sh "fix: update Kbazar SEO" # deploys with a custom commit message
#   ./deploy.sh --no-commit             # skip git commit if already committed
#
# Sequence: local build -> optional commit -> rsync -> VPS install if needed ->
#           VPS build -> pm2 restart -> smoke test -> push origin/main.

set -euo pipefail

LOCAL=/root/kbazar24-platform
VPS=/var/www/kbazar24-platform
APP=apps/web
PM2_NAME=kbazar24web
SMOKE_URL=https://kbazar24.com/

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'

info()    { echo -e "${CYAN}> $*${NC}"; }
success() { echo -e "${GREEN}✓ $*${NC}"; }
warn()    { echo -e "${YELLOW}⚠ $*${NC}"; }
die()     { echo -e "${RED}✗ $*${NC}"; exit 1; }

SKIP_COMMIT=false
COMMIT_MSG=""

for arg in "$@"; do
  case "$arg" in
    --no-commit) SKIP_COMMIT=true ;;
    *) COMMIT_MSG="$arg" ;;
  esac
done

info "Safety check - Kbazar paths"
if [ "$(pwd -P)" != "$LOCAL" ]; then
  warn "Running from $(pwd -P); switching to $LOCAL"
fi
cd "$LOCAL"

if ! git remote get-url origin | grep -q 'shadinmominur-arch/kbazar24-platform'; then
  die "origin is not the Kbazar GitHub repo. Refusing to deploy."
fi

info "Step 1/7 - Local build"
cd "$LOCAL/$APP"
npm run build || die "Local build failed. Fix errors before deploying."
success "Local build passed"

if [ "$SKIP_COMMIT" = false ]; then
  info "Step 2/7 - Git commit"
  cd "$LOCAL"
  git add -A

  if git diff --cached --quiet; then
    warn "Nothing staged - skipping commit"
  else
    if [ -z "$COMMIT_MSG" ]; then
      COMMIT_MSG="deploy: $(date '+%Y-%m-%d %H:%M')"
    fi
    git commit -m "$COMMIT_MSG

Co-Authored-By: deploy.sh <noreply@kbazar24.com>"
    success "Committed: $COMMIT_MSG"
  fi
else
  info "Step 2/7 - Skipping commit (--no-commit)"
fi

info "Step 3/7 - rsync Local -> VPS"
rsync -a --delete \
  --exclude='.git' \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='.env.local' \
  --exclude='public/audit' \
  --exclude='*.tsbuildinfo' \
  "$LOCAL/$APP/" "$VPS/$APP/"

rsync -a --delete \
  --exclude='.git' \
  "$LOCAL/workspace/" "$VPS/workspace/"

rsync -a \
  --exclude='.git' \
  --exclude='node_modules' \
  --exclude='apps' \
  --exclude='workspace' \
  "$LOCAL/" "$VPS/"
success "rsync complete"

info "Step 4/7 - VPS npm install if needed"
cd "$VPS/$APP"
if ! cmp -s "$LOCAL/$APP/package-lock.json" "$VPS/$APP/package-lock.json"; then
  npm install --prefer-offline
  success "npm install complete"
else
  success "package-lock.json unchanged - skipping install"
fi

info "Step 5/7 - VPS build"
npm run build || die "VPS build failed. Site still runs old build."
success "VPS build passed"

info "Step 6/7 - pm2 restart $PM2_NAME"
pm2 restart "$PM2_NAME"
sleep 4
success "pm2 restarted"

info "Step 7/7 - Smoke test $SMOKE_URL"
HTTP=$(curl -fsS -o /dev/null -w "%{http_code}" "$SMOKE_URL" 2>&1) || true
if [ "$HTTP" = "200" ]; then
  success "Live: HTTP $HTTP"
else
  die "Smoke test failed with HTTP $HTTP. Not pushing. Check: pm2 logs $PM2_NAME --lines 50"
fi

info "Pushing to origin/main"
cd "$LOCAL"
git push origin main
success "Pushed to origin/main"

echo ""
echo -e "${BOLD}${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}${GREEN}  Kbazar deploy complete  ✓${NC}"
echo -e "${BOLD}${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "  Commit: $(git -C "$LOCAL" rev-parse --short HEAD)"
echo -e "  Live:   $SMOKE_URL"
