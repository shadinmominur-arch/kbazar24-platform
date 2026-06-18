#!/usr/bin/env bash
# sync-from-emart.sh — selectively copy specific files/dirs from Emart into Kbazar
#
# Usage:
#   ./workspace/scripts/sync-from-emart.sh src/components/checkout   # copy one dir
#   ./workspace/scripts/sync-from-emart.sh src/app/api/auth/login/route.ts  # one file
#   ./workspace/scripts/sync-from-emart.sh src/lib/woo.ts src/lib/cart.ts   # multiple
#   ./workspace/scripts/sync-from-emart.sh --diff src/components/Footer.tsx # show diff only
#   ./workspace/scripts/sync-from-emart.sh --list                   # list all differences
#
# Paths are relative to apps/web/. Kbazar .env.local is never touched.

set -euo pipefail

EMART=/root/emart-platform/apps/web
KBAZAR=/root/kbazar24-platform/apps/web

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; NC='\033[0m'

info()    { echo -e "${CYAN}> $*${NC}"; }
success() { echo -e "${GREEN}✓ $*${NC}"; }
warn()    { echo -e "${YELLOW}⚠ $*${NC}"; }
die()     { echo -e "${RED}✗ $*${NC}"; exit 1; }

[ -d "$EMART/src" ] || die "Emart not found at $EMART"
[ -d "$KBAZAR/src" ] || die "Kbazar not found at $KBAZAR"

# ── --list: show all files that differ ───────────────────
if [ "${1:-}" = "--list" ]; then
  info "Files that differ between Emart and Kbazar (apps/web/):"
  diff -rq "$EMART/src" "$KBAZAR/src" 2>/dev/null | sed "s|$EMART/||;s|$KBAZAR/||" || true
  echo ""
  diff -rq "$EMART/public" "$KBAZAR/public" 2>/dev/null | sed "s|$EMART/||;s|$KBAZAR/||" || true
  echo ""
  for f in next.config.ts package.json tailwind.config.ts; do
    if ! diff -q "$EMART/$f" "$KBAZAR/$f" &>/dev/null; then
      echo "DIFFERS: $f"
    fi
  done
  exit 0
fi

# ── --diff: show diff for specific file ──────────────────
if [ "${1:-}" = "--diff" ]; then
  shift
  [ -n "${1:-}" ] || die "Usage: --diff <path relative to apps/web/>"
  diff --color -u "$KBAZAR/$1" "$EMART/$1" 2>/dev/null || true
  exit 0
fi

# ── Copy specific files/dirs ─────────────────────────────
[ -n "${1:-}" ] || die "Usage: sync-from-emart.sh <path> [<path> ...]\n  Paths relative to apps/web/. Use --list to see differences."

COPIED=0
for target in "$@"; do
  src="$EMART/$target"
  dst="$KBAZAR/$target"

  if [ ! -e "$src" ]; then
    warn "Not found in Emart: $target — skipping"
    continue
  fi

  if [ -d "$src" ]; then
    mkdir -p "$dst"
    rsync -a --delete "$src/" "$dst/"
    success "DIR  $target"
  else
    mkdir -p "$(dirname "$dst")"
    cp "$src" "$dst"
    success "FILE $target"
  fi
  COPIED=$((COPIED + 1))
done

echo ""
info "$COPIED item(s) copied from Emart → Kbazar"
info "Next: review changes, then ./deploy.sh \"sync: <what you pulled>\""
