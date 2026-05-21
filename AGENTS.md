# Emart — Agent Entry Point

Bangladesh K-beauty e-commerce. Next.js 14 frontend + WooCommerce/WordPress backend.
Live at **e-mart.com.bd** · BDT · COD / bKash / Nagad · mobile-first.

---

## Read This First (in order)

1. `/root/CLAUDE.md` — universal VPS deploy law for every project
2. `/root/emart-platform/CLAUDE.md` — Emart safety rules, brand invariants, SEO architecture
3. `apps/web/.agent-memory/MEMORY.md` — shared durable agent memory (Claude + Codex)
4. `workspace/TASKS.md` — open task board, priority-ordered

---

## Current Site State — 2026-05-21

| Item | State |
|---|---|
| Live site | ✅ `https://e-mart.com.bd` — serving |
| PM2 `emartweb` | ✅ online |
| PM2 `emart-presence` | ✅ online (WebSocket) |
| Local git | `3cead05` — workspace restructuring uncommitted (see below) |
| VPS git | matches Local source; dirty workspace files from restructuring session |
| Android app | v1.1.0 in Play Store internal testing |
| iOS | pending Apple Developer account |

**Uncommitted workspace changes (2026-05-21 restructuring):**
- `workspace/active/` and `workspace/archive/` removed — contents moved to `workspace/audit/`, `workspace/scripts/`, `workspace/docs/`
- `workspace/DEV_MASTER.md`, `SEO_MASTER.md`, `PROJECT_BASELINE.md` updated
- Commit these before starting new work

---

## File Map

| File / Folder | What it is |
|---|---|
| `AGENTS.md` | **This file** — entry point, current state, last session |
| `CLAUDE.md` | Full project policy — safety rules, brand invariants, SEO architecture, deploy order |
| `workspace/PROJECT_BASELINE.md` | Project map — read if lost |
| `workspace/SEO_MASTER.md` | SEO task list, confirmed-done items, schema map |
| `workspace/DEV_MASTER.md` | Dev task detail — web/mobile/backend ownership, shared zone |
| `workspace/BRAND_GUIDE.md` | Brand name, tagline, tone invariants |
| `workspace/VPS_RESOURCE_MAP.md` | VPS processes, ports, RAM, disk |
| `workspace/ARCHIVE_INDEX.md` | Master catalog of all archived scripts and audits |
| `workspace/ATTIC_INDEX.md` | Files moved to `/root/.attic-*/` outside project |
| `workspace/docs/` | Reference docs — category taxonomy, theme contract, mobile build notes |
| `workspace/audit/active/` | Active audit files — pa_concern CSV, origin gaps, image review, 404 redirects |
| `workspace/audit/archive/` | Completed audit runs (historical) |
| `workspace/scripts/active/` | Active scripts — maintained, reusable |
| `workspace/scripts/archive/` | Completed one-off scripts (reference only) |
| `workspace/TASKS.md` | Open task board — single priority list for all agents |
| `apps/web/.agent-memory/MEMORY.md` | Shared durable agent memory |
| `apps/web/SESSION-LOG.md` | Per-session log — append a block each session |

---

## Agent Ownership

| Area | Owner |
|---|---|
| `apps/web` — Next.js, TypeScript, SEO, content | Claude Code |
| `apps/mobile` — Expo app, Android/iOS | Codex |
| PHP mu-plugins, WordPress DB mutations | Codex |
| WooCommerce REST data mutations | Codex (dry-run first, always) |
| Shared: `api/mobile/*`, `api/checkout`, `lib/woocommerce.ts` | Coordinate — see `DEV_MASTER.md` |

---

## Key Rules (detail in `CLAUDE.md`)

- **Deploy order:** Local edit → build → commit → rsync VPS → VPS build → pm2 restart → smoke test → push GitHub last
- **Never push to `origin/main` before smoke test passes**
- **Dry-run rule:** never bulk-mutate WooCommerce data without a dry-run CSV reviewed by owner
- **Brand names:** `Emart` (short) · `Emart Skincare Bangladesh` (full) · `e-mart.com.bd` (domain)
- **Two WhatsApp numbers are intentional:** sales `8801717082135` · support `8801919797399` — do not merge

---

## 🧊 6-Week Stability Freeze — 2026-05-22 → 2026-07-03

No URL changes, no redirects, no sitemap structure changes, no navigation restructuring.
Only: product data, images, blog posts, small bug fixes, mobile internals.
**Exception:** serious bugs (site down, checkout broken, security, 500 on revenue pages) override the freeze — fix immediately, minimal scope, then stop.
See `workspace/TASKS.md` for the full freeze list.

---

## Last Session — 2026-05-22

**Did:** Workspace restructuring — unified all `workspace/active/` and `workspace/archive/` split-pattern into type-first layout. Unified TASKS.md, DEV_MASTER.md, SEO_MASTER.md into single priority board. Updated docs/category-taxonomy-status.md with post-cleanup product counts.

**Changes not yet committed:**
- Workspace folder moves (active/ archive/ removed, audit/ scripts/ docs/ unified)
- TASKS.md rewritten as single priority board
- DEV_MASTER.md and SEO_MASTER.md trimmed and de-duped
- PROJECT_BASELINE.md and docs/category-taxonomy-status.md stale paths fixed
- AGENTS.md + HANDOFF.md merged into this file

**Next session starts at:**
1. Commit workspace restructuring (docs only, zero live impact)
2. Owner reviews pa_concern CSV → Codex applies
3. Remaining DO NOW items in `workspace/TASKS.md`
4. Then freeze — no structural changes until 2026-07-03
