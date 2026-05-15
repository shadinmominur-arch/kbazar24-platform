# Emart Platform — Session Handoff

> Read this. Nothing else needed to start. Update the "Last Session" block before you stop.

---

## What This Is

Bangladesh K-beauty e-commerce. Next.js 14 frontend (`apps/web`) + WooCommerce/WordPress backend.  
Live at **e-mart.com.bd** — mobile-first, BDT currency, COD/bKash/Nagad payments.  
Mobile app at `apps/mobile` (Expo). Presence WebSocket at `apps/presence-server`.

## Current State — 2026-05-15

- **Live and healthy** — PM2 `emartweb` + `emart-presence` running, site serving
- **Git clean** — Local `/root/emart-platform` = VPS `/var/www/emart-platform` = GitHub `main` at `9a72f1a`
- **Workspace reorganised** — two folders: `workspace/active/` (in play) + `workspace/archive/` (done)

## Active Tasks — Do These Next (priority order)

| # | Task | File | Effort |
|---|------|------|--------|
| 1 | SEO H1 — fix `aria-hidden` focusability, homepage mobile rails | `apps/web/src/components/home/HomepageSections.tsx` | Small |
| 2 | SEO H2 — ProductCard image `priority`, reduce to true LCP only | `apps/web/src/components/product/ProductCard.tsx` | Small |
| 3 | 404 redirects — cross-ref GSC export with redirect xlsx | `workspace/active/audits/gsc-404-report-20260512/` + `workspace/active/data/404 redirect.xlsx` | Medium |
| 4 | WH1 — fix stale `SEO_TODO.md` refs in `CLAUDE.md` | `CLAUDE.md` lines 25, 117, 118, 189, 194 | Trivial |
| 5 | WH3 — archive completed mutator scripts | `workspace/active/scripts/pa-ingredient-skintype-apply.php`, `fix-wrong-korea-origin-products.php` | Trivial |
| 6 | Owner data needed — 119 products missing SKU | `workspace/active/scripts/product-sku-audit-dry-run.php` | Blocked |
| 7 | Owner upload needed — 16 products missing images | `workspace/active/data/products-need-real-image.csv` | Blocked |
| 8 | Owner decision needed — 155 price rows unmatched | `workspace/active/data/manual-review-size-notmatched.csv` | Blocked |

## File Map — One Line Each

| File / Folder | What it is |
|---------------|-----------|
| `HANDOFF.md` | **This file** — update before ending session |
| `CLAUDE.md` | Project safety rules, brand invariants, deploy order |
| `AGENTS.md` | Agent coordination contract |
| `workspace/PROJECT_BASELINE.md` | Full project map — read if lost |
| `workspace/SEO_MASTER.md` | SEO task list, priorities, done items |
| `workspace/DEV_MASTER.md` | Dev task list, UI/UX + hygiene tasks, ownership |
| `workspace/VPS_RESOURCE_MAP.md` | All VPS projects, ports, RAM, disk, free slots |
| `workspace/ATTIC_INDEX.md` | Files moved to `/root/.attic-2026-05-15/` outside project |
| `workspace/BRAND_GUIDE.md` | Brand name, tagline, tone invariants |
| `workspace/active/README.md` | Full status of every active item |
| `workspace/active/scripts/` | 10 active PHP/bash/mjs scripts |
| `workspace/active/audits/` | GSC 404 URL export |
| `workspace/active/data/` | 404 redirect xlsx + 2 owner-review CSVs |
| `workspace/active/docs/` | theme-contract + category-taxonomy + mobile-build-notes |
| `workspace/archive/` | All completed work (audits + scripts) |
| `apps/web/SESSION-LOG.md` | Per-session log — append a block each session |
| `apps/web/.agent-memory/MEMORY.md` | Shared durable memory — read at session start |

## Deploy Law — Non-Negotiable

```
Edit Local → build → commit → rsync to VPS → build VPS → pm2 restart → smoke test → push GitHub LAST
```
Never push to GitHub before verifying live. Full rules: `/root/CLAUDE.md`.

## Do Not Touch Without Explicit Owner Approval

- Checkout / cart / payment / order / customer / stock / price logic
- `apps/web/src/app/api/checkout`
- Any WooCommerce DB mutation without a dry-run first
- Force-push to `origin/main`

## Protected Numbers / Accounts

- Sales WhatsApp: `8801717082135`
- Support WhatsApp: `8801919797399`
- Do not merge these two numbers

## Last Session — 2026-05-15 — Claude

**Did:** Full workspace reorganisation — baseline unification session.
- Created `workspace/PROJECT_BASELINE.md` + `workspace/VPS_RESOURCE_MAP.md` + `workspace/ATTIC_INDEX.md`
- Consolidated all active work into `workspace/active/` (scripts/ audits/ data/ docs/)
- Collapsed `audit/` + `scripts/` into single `workspace/archive/` folder
- Moved stale `/var/www/` folders to `/root/.attic-2026-05-15/stale-www-2026-05-15.tar.gz` (compressed 3GB → 781MB)
- Archived idle emart-archive batch outputs to `/root/.attic-2026-05-15/emart-archive/`
- DetailsTabs server-render fix live (`f64fbf2`) — ingredients/how-to-use now in initial HTML
- All taxonomy work done (pa_concern 2,236 / pa_ingredient 1,088 / pa_skin_type 28 products)

**Next session starts at:** SEO H1 (aria-hidden fix) — small, low risk, good warm-up.
