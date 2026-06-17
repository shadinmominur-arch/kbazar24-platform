# Kbazar24 - Agent Entry Point

Bangladesh K-beauty e-commerce project. Next.js frontend with WooCommerce/WordPress backend.
Live at **kbazar24.com**. Currency: BDT. Payments: COD, bKash, Nagad.

## Stack & Commands

- Next.js 14, React 18, Tailwind 3, TypeScript.
- App root: `apps/web`.
- Build: `cd apps/web && npm run build`.
- PM2 process: `kbazar24web`.
- Local source: `/root/kbazar24-platform`.
- VPS runtime: `/var/www/kbazar24-platform`.
- WordPress backend: `/var/www/kbazar24-wp`.
- Internal Woo/WordPress URL: `http://127.0.0.1:8082`.
- Public URL: `https://kbazar24.com`.
- Repo: `https://github.com/shadinmominur-arch/kbazar24-platform`.

## Brand

- Short name: **Kbazar**.
- Store name: **Kbazar Korean Cosmetics Store**.
- Domain: **kbazar24.com**.
- Do not use Emart as the public brand for this project.

## Safety

- Claude and Codex may work concurrently. Always run `git status --short` before editing.
- Do not overwrite another agent's active work.
- Do not touch WooCommerce product/order/customer/stock/price data without explicit user request.
- Do not commit secrets. Keep `.env.local` runtime-only.
- Do not use inherited Emart deployment commands or task state.
- Preserve `_emart_*` meta keys or `/wp-json/emart/v1/*` endpoints only when the cloned backend still requires them; public copy and SEO must be Kbazar-specific.

## Deploy Rules

- Use Kbazar paths and PM2 process only.
- Expected deploy sequence: local build -> commit -> rsync to `/var/www/kbazar24-platform` -> VPS build -> `pm2 restart kbazar24web` -> live smoke -> push.
- Smoke at minimum: `/`, `/shop`, one category, one product, `/robots.txt`, `/sitemap.xml`, `/agents.md`, `/llms.txt`.
- Never run an Emart deploy script from this repo.

## Session Protocol

- Start: read `apps/web/.agent-memory/MEMORY.md`, tail `apps/web/SESSION-LOG.md`, read `workspace/TASKS.md`, inspect `git status --short`, and check recent commits.
- End: append a concise block to `apps/web/SESSION-LOG.md` and update `workspace/TASKS.md`.

## Current Priority

1. Keep deploy/PM2 configuration Kbazar-specific.
2. Remove public Emart references from Kbazar-facing docs, SEO, feeds, and UI.
3. Rotate weak/runtime secrets.
4. Protect WordPress admin and make REST routing intentional.
5. Keep builds and live smoke tests clean.
