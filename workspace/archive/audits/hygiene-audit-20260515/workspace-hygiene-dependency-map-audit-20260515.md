# Emart Workspace Hygiene + Dependency Map Audit

Date: 2026-05-15  
Repo: `/root/emart-platform`  
Branch observed: `main`  
Latest HEAD observed during audit: `8712308 seo: add MerchantReturnPolicy schema + remove artificial priceValidUntil`  
Origin status observed: local `main` was ahead of `origin/main` by 1 because Claude was still working live.  
Mode: read-only audit plus this report only. No deploy, no PM2 restart, no Woo mutation, no production logic edit.

## Executive Opinion

The runtime codebase is not fundamentally disorganized. The live application structure is coherent: `apps/web` owns the public Next.js storefront and SEO surface, `apps/mobile` consumes secure BFF/API routes, `apps/presence-server` is isolated, and `workspace/` is the operations/audit/script layer.

The messy part is not the storefront itself. The messy part is transitional workspace state: old docs that still point to retired files, active audit folders containing completed generated outputs, active scripts that are half reusable and half one-off batch tools, and several root-level workspace CSVs that are still current business review files but do not fit the newer active/archive convention.

Because Claude is working live right now, do not archive or move active pa_concern / pa_ingredient / pa_skin_type artifacts yet. First let Claude finish and get the worktree clean. Then reorganize in a narrow cleanup pass with a manifest.

## Current State Snapshot

- `git status` changed during this audit because Claude was active.
- At latest check, branch was `main`, local `HEAD` was ahead of `origin/main` by 1, and `workspace/DEV_MASTER.md` had an uncommitted update marking B1 taxonomy assignment done.
- New recent commits observed while this audit was running:
  - `050b711 feat: apply pa_ingredient + pa_skin_type to 1,110 products`
  - `8712308 seo: add MerchantReturnPolicy schema + remove artificial priceValidUntil`
- `workspace/SEO_TODO.md` no longer exists at workspace root. A historical copy exists under `workspace/audit/archive/seo-source-audits-referenced-by-master-20260515/SEO_TODO.md`.
- Current SEO source of truth is `workspace/SEO_MASTER.md` plus the archived master audit at `workspace/audit/archive/reference-audits-20260515/e-mart-master-technical-seo-image-crawler-audit-20260515.md`.
- `workspace/docs/ARCHIVE-INDEX.md` is stale: it still references active reports/scripts that were moved or replaced.

## Runtime Dependency Map

### Public Web Surface

Keep these as the natural center of the site:

- `apps/web/src/app/` - Next.js App Router pages, metadata, robots, sitemap, public and private routes.
- `apps/web/src/components/` - storefront UI components used by routes.
- `apps/web/src/lib/` - Woo/WordPress data clients, SEO helpers, canonical URL helpers, sitemap entries, category/concern/ingredient logic, schema helpers, commerce config.
- `apps/web/src/store/` - client state such as cart/wishlist.
- `apps/web/src/styles/` and `apps/web/src/app/globals.css` - global styling.
- `apps/web/src/middleware.ts` - query cleanup, junk-route handling, canonical redirects.
- `apps/web/next.config.js` - image domains, headers, private-route no-store, redirects, CSP, package optimizations.
- `apps/web/package.json`, `package-lock.json`, `tsconfig.json`, `tailwind.config.js`, `postcss.config.js`, `.env.example` - build and environment contract.

High-level request flow:

```text
Crawler/browser
  -> Next middleware
  -> next.config headers/redirects
  -> app route/page/layout
  -> lib SEO/canonical/schema helpers
  -> lib Woo/WordPress data fetchers
  -> private WordPress/WooCommerce backend
```

### SEO And Crawl Layer

Core keep files:

- `apps/web/src/app/robots.ts`
- `apps/web/src/app/sitemap.xml/route.ts`
- `apps/web/src/app/sitemap.xsl/route.ts`
- `apps/web/src/lib/sitemapEntries.ts`
- `apps/web/src/lib/siteUrl.ts`
- `apps/web/src/lib/canonicalUrl.ts`
- `apps/web/src/lib/seo.ts`
- Dynamic route metadata in product/category/brand/concern/ingredient/routine/blog routes.
- `apps/web/next.config.js` redirects and private-route headers.
- `apps/web/src/middleware.ts` query duplicate cleanup.

Do not move SEO logic into WordPress theme templates. Public SEO belongs in `apps/web`.

### Product And Catalog Layer

Core keep files/areas:

- Product PDP: `apps/web/src/app/shop/[slug]/page.tsx`
- Shop listing: `apps/web/src/app/shop/page.tsx`
- Category listing: `apps/web/src/app/category/[slug]/page.tsx`
- Brand listing: `apps/web/src/app/brands/[slug]/page.tsx`
- Concern listing: `apps/web/src/app/concerns/[slug]/page.tsx`
- Ingredient/routine/blog routes where present.
- Product components such as `ProductCard`, `ProductInfo`, `DetailsTabs`, gallery/review components.
- Data clients in `apps/web/src/lib/woocommerce.ts`, WordPress post/GraphQL helpers, and taxonomy helper files.

Protected dependency rule:

- Product page visible data, Product schema, Merchant Center data, Woo source data, price, stock, brand, origin, SKU, and images must agree.
- Do not touch checkout/cart/payment/order/customer/stock/price logic unless explicitly approved.

### Mobile Layer

Core keep files/areas:

- `apps/mobile/` Expo app.
- Mobile must consume secure Next.js BFF/API routes.
- It must not ship Woo keys, Woo secrets, or direct Woo private API credentials.
- Shared web/mobile route areas: `apps/web/src/app/api/mobile/*`, `apps/web/src/app/api/checkout`, and `apps/web/src/lib/woocommerce.ts`.

### Presence Layer

Core keep files/areas:

- `apps/presence-server/package.json`
- `apps/presence-server/server.js`

This is isolated from SEO. Do not mix presence-service cleanup with web SEO or Woo data tasks.

### Workspace Operations Layer

Core keep areas:

- `workspace/SEO_MASTER.md` - current SEO priority source.
- `workspace/DEV_MASTER.md` - current cross-agent task ownership source.
- `workspace/BRAND_GUIDE.md` - brand rules.
- `workspace/CLOUDFLARE_CACHE_RULES.md` - dashboard-only cache rule notes.
- `workspace/docs/category-taxonomy-status.md` - category/taxonomy source of truth.
- `workspace/audit/active/` - current user-review reports only.
- `workspace/audit/archive/` - completed generated reports and reference audits.
- `workspace/scripts/active/` - maintained reusable scripts and temporarily active batch scripts.
- `workspace/scripts/archive/` - one-off historical scripts.

## Hygiene Findings

### 1. Do Not Clean Up While Claude Is Mid-Run

- Severity: High
- Area: coordination / workspace safety
- Evidence: branch `main` advanced to `050b711` during this audit; `workspace/DEV_MASTER.md` changed after the commit.
- Why it matters: moving active CSVs or scripts while Claude is applying/verifying taxonomy work can break the handoff trail.
- Recommendation: wait for Claude to finish, then run `git status --short --branch` and archive only completed artifacts with a manifest.
- Risk level: Low if delayed; medium if cleanup happens immediately.

### 2. Current Instructions Still Reference Retired SEO_TODO Path

- Severity: High
- Area: docs / agent routing
- Files:
  - `CLAUDE.md`
  - `apps/web/TASKS.md`
  - historical references in memory/session docs
- Evidence: `workspace/SEO_TODO.md` is missing, while the historical copy is archived and `workspace/SEO_MASTER.md` is current.
- Why it matters: future agents may search for a missing file, resurrect stale SEO tasks, or ignore the current master audit.
- Recommendation: update active instructions to say `workspace/SEO_MASTER.md` replaced root `workspace/SEO_TODO.md`; keep the archived copy reference-only.
- Risk level: Low.

### 3. Root `apps/web/MEMORY.md` Conflicts With Current Deploy Law

- Severity: High
- Area: docs / operational safety
- Files:
  - `apps/web/MEMORY.md`
  - `apps/web/.agent-memory/MEMORY.md`
  - `/root/CLAUDE.md`
  - `AGENTS.md`
- Evidence: `apps/web/MEMORY.md` says to work VPS-first and treat `/root/emart-platform/apps/web` as backup/reference. Current policy says edit on Local, sync to VPS, verify live, push Repo last. Canonical shared memory is now `apps/web/.agent-memory/`.
- Why it matters: a future agent could follow the stale root memory and edit runtime files directly.
- Recommendation: after active Claude work is complete, archive or clearly mark `apps/web/MEMORY.md` as historical. Keep `.agent-memory/MEMORY.md` as canonical.
- Risk level: Medium until clarified.

### 4. SEO_MASTER Is Slightly Stale After Taxonomy Apply

- Severity: Medium
- Area: SEO master task tracking
- Files:
  - `workspace/SEO_MASTER.md`
  - `workspace/DEV_MASTER.md`
- Evidence: `workspace/DEV_MASTER.md` now marks B1 `pa_concern + pa_skin_type + pa_ingredient` done on 2026-05-15; `workspace/SEO_MASTER.md` still lists M5 as pending.
- Why it matters: the next SEO audit/job list may repeat a completed Woo taxonomy task.
- Recommendation: update `SEO_MASTER.md` after Claude finishes verification. Mark M5 done, keep only follow-up validation if needed.
- Risk level: Low.

### 5. Active Audit Folder Contains Completed Generated Outputs

- Severity: Medium
- Area: workspace/audit hygiene
- Files:
  - `workspace/audit/active/pa-concern-skintype-dry-run-20260515-190756.csv`
  - `workspace/audit/active/pa-ingredient-skintype-dry-run-20260515-191003.csv`
  - `workspace/audit/active/pa-ingredient-skintype-dry-run-20260515-191037.csv`
  - `workspace/audit/active/pa-ingredient-skintype-apply-20260515-191107.csv`
  - `workspace/audit/active/pa-ingredient-skintype-apply-20260515-191226.csv`
  - `workspace/audit/active/pa-ingredient-skintype-apply-20260515-191318.csv`
  - `workspace/audit/active/SESSION-LOG.md`
- Evidence: active README says active is for current user-review reports only and not durable memory or scratch output. These files are current/in-flight today, but several look like apply logs that should become archived evidence after verification.
- Why it matters: active folder stops being useful when it contains both current decisions and completed evidence.
- Recommendation: after Claude closes taxonomy verification, move the completed taxonomy batch outputs into an archive folder such as `workspace/audit/archive/pa-taxonomy-20260515/`. Remove the duplicate `workspace/audit/active/SESSION-LOG.md` if it is only a copy of the real session log.
- Risk level: Low after the live batch is closed.

### 6. Active Scripts Mix Reusable Tools And Completed Batch Mutators

- Severity: Medium
- Area: script hygiene
- Files:
  - `workspace/scripts/active/pa-concern-skin-type-dry-run.php`
  - `workspace/scripts/active/pa-ingredient-skintype-apply.php`
  - `workspace/scripts/active/fix-wrong-korea-origin-products.php`
  - `workspace/scripts/active/audit-wrong-korea-origin-products.php`
- Evidence: B1 taxonomy assignment is now reported done; wrong-Korea origin/copy work is mostly completed but scripts remain active.
- Why it matters: active mutating scripts invite accidental reruns.
- Recommendation: keep read-only audit scripts active only if they remain useful. Move completed apply scripts to `workspace/scripts/archive/pa-taxonomy-20260515/` or `workspace/scripts/archive/completed-korea-origin-20260515/` after verification and update `ARCHIVE-INDEX.md`.
- Risk level: Medium if mutators stay active without a clear status note.

### 7. Script Output Paths Are Not Fully Standardized

- Severity: Medium
- Area: script reliability
- Files:
  - `workspace/scripts/active/product-image-brand-size-audit.mjs`
  - `workspace/scripts/active/pa-concern-skin-type-dry-run.php`
- Evidence:
  - `product-image-brand-size-audit.mjs` defaults `OUT` to `workspace/audit/seo/product-image-brand-size-20260503.csv`, a retired location.
  - `pa-concern-skin-type-dry-run.php` writes to `/var/www/emart-platform/workspace/audit/active`, while most local reports belong under `/root/emart-platform/workspace/audit/active`.
- Why it matters: scripts can recreate retired folders or write to the runtime tree when the operator expects local output.
- Recommendation: standardize scripts to use repo-root-relative output or an explicit `OUT` / `OUT_DIR` env var. Prefer failing with a clear message over silently writing to a stale path.
- Risk level: Low to medium.

### 8. `workspace/docs/ARCHIVE-INDEX.md` Is Stale

- Severity: Medium
- Area: archive discoverability
- File: `workspace/docs/ARCHIVE-INDEX.md`
- Evidence: it still lists active scripts such as `verify-deployment.sh`, `build-open-image-review-audit.mjs`, and `targeted-product-image-ocr.mjs`, which are now archived or absent from active scripts. It also lists the master SEO audit as active, but the current master audit is archived and referenced by `SEO_MASTER.md`.
- Why it matters: future agents may search the wrong place or resurrect old files.
- Recommendation: update the archive index after cleanup pass, not during Claude's active run.
- Risk level: Low.

### 9. App-Local Scripts Need A Keep/Archive Decision

- Severity: Medium
- Area: script ownership
- Files:
  - `apps/web/scripts/check-all.sh`
  - `apps/web/scripts/audit-duplicate-products.mjs`
  - `apps/web/scripts/seo-p1-preview.mjs`
  - `apps/web/scripts/ocr-image-audit.mjs`
  - `apps/web/scripts/image-logic-fixer.mjs`
- Evidence: `apps/web/package.json` references `check:all` and `audit:duplicates`; the other scripts are not package scripts. Some are historical image/SEO utilities and write to `/tmp` or require Woo env keys.
- Why it matters: `apps/web/scripts` should hold app-local maintained scripts, not retired one-off data repair tools.
- Recommendation:
  - Keep `check-all.sh` and `audit-duplicate-products.mjs` because package scripts reference them.
  - Review `seo-p1-preview.mjs`, `ocr-image-audit.mjs`, and `image-logic-fixer.mjs`; if no current owner uses them, move to `workspace/scripts/archive/` with notes.
- Risk level: Low.

### 10. Workspace Root CSVs Are Still Business Backlog, But Need Final Home

- Severity: Medium
- Area: data hygiene
- Files:
  - `workspace/manual-review-needed.csv`
  - `workspace/manual-review-size-matched.csv`
  - `workspace/manual-review-size-notmatched.csv`
  - `workspace/products-need-real-image.csv`
- Evidence: session log says `manual-review-size-matched.csv` was used for a Claude price update; `manual-review-size-notmatched.csv` and `products-need-real-image.csv` remain pending.
- Why it matters: root workspace CSVs are easy to mistake for stale scratch files.
- Recommendation:
  - Keep `manual-review-size-notmatched.csv` and `products-need-real-image.csv` active until owner decisions/uploads are done.
  - Archive `manual-review-size-matched.csv` after the 426-row price apply is verified and no rollback review is pending.
  - If `manual-review-needed.csv` was superseded by matched/notmatched split files, archive it with a note.
- Risk level: Low if reviewed before moving.

### 11. Build Artifacts And Secrets Are Properly Ignored, But Must Stay Untouched

- Severity: Low
- Area: local hygiene
- Files:
  - `apps/web/.env.local`
  - `apps/web/.env.local.backup-20260502-google-restore`
  - `apps/web/tsconfig.tsbuildinfo`
  - `.gitignore`
- Evidence: `.gitignore` ignores `.env`, `.env.local`, `*.env.*`, `.next/`, `node_modules/`, and `*.tsbuildinfo`.
- Why it matters: no cleanup should read or expose env values; ignored build artifacts should not be archived into workspace.
- Recommendation: leave env/build artifacts alone. Do not commit or copy env backups into audit folders.
- Risk level: Low.

## Keep / Archive / Update Decision Table

| Path | Current role | Decision | Timing |
|---|---|---|---|
| `apps/web/src/` | Public storefront runtime code | Keep | Always |
| `apps/web/next.config.js` | Headers, redirects, images, CSP | Keep | Always |
| `apps/web/src/middleware.ts` | Query and route cleanup | Keep | Always |
| `apps/web/src/app/robots.ts` | Robots policy | Keep | Always |
| `apps/web/src/app/sitemap.xml/route.ts` | Public sitemap | Keep | Always |
| `apps/web/src/lib/sitemapEntries.ts` | Dynamic sitemap source | Keep | Always |
| `apps/mobile/` | Expo mobile app | Keep | Always |
| `apps/presence-server/` | Presence WebSocket server | Keep | Always |
| `apps/web/.agent-memory/` | Canonical shared durable memory | Keep | Always |
| `apps/web/SESSION-LOG.md` | Canonical local session log | Keep | Always |
| `apps/web/TASKS.md` | Historical task board plus Week 2 section | Keep, but refresh stale references | After Claude finishes |
| `apps/web/MEMORY.md` | Old root memory, conflicts with current deploy law | Archive or mark historical | After confirmation |
| `apps/web/RESUME.md` | Old legacy import resume guide | Archive candidate | After confirmation |
| `apps/web/DECISIONS.md` | Old locked decisions; some stale | Review then archive/merge | Later |
| `apps/web/LIVE-SOURCE-OF-TRUTH.md` | Old live-source note; partially stale | Review then archive/merge | Later |
| `workspace/SEO_MASTER.md` | Current SEO priority source | Keep and update | Soon |
| `workspace/DEV_MASTER.md` | Cross-agent ownership source | Keep; Claude currently editing | Do not touch now |
| `workspace/BRAND_GUIDE.md` | Brand invariants | Keep | Always |
| `workspace/CLOUDFLARE_CACHE_RULES.md` | Cache dashboard reference | Keep | Always |
| `workspace/docs/category-taxonomy-status.md` | Taxonomy rules | Keep | Always |
| `workspace/docs/ARCHIVE-INDEX.md` | Archive map | Update | After cleanup |
| `workspace/audit/archive/reference-audits-20260515/` | Final SEO reference audits | Keep archived | Always |
| `workspace/audit/active/SESSION-LOG.md` | Duplicate session log copy | Archive/remove candidate | After Claude finishes |
| `workspace/audit/active/pa-*20260515*.csv` | Current taxonomy apply evidence | Archive after verification | Not now |
| `workspace/scripts/active/product-seo-audit.php` | Reusable read-only product SEO audit | Keep active | Current |
| `workspace/scripts/active/product-sku-audit-dry-run.php` | Reusable read-only SKU audit | Keep active | Current |
| `workspace/scripts/active/audit-seo-index-bloat.sh` | Reusable SEO audit | Keep active | Current |
| `workspace/scripts/active/emart-seo-backend-smoke.sh` | Reusable smoke/audit script | Keep active | Current |
| `workspace/scripts/active/sync-local-to-vps.sh` | Deploy utility | Keep active, use carefully | Current |
| `workspace/scripts/active/pa-ingredient-skintype-apply.php` | Completed/temporary mutator | Archive after verification | Not now |
| `workspace/scripts/active/pa-concern-skin-type-dry-run.php` | Completed/temporary dry-run | Archive or keep read-only with note | After verification |
| `workspace/scripts/active/fix-wrong-korea-origin-products.php` | Completed/temporary mutator | Archive after final clean audit | Later |
| `workspace/manual-review-size-notmatched.csv` | Pending owner review | Keep | Current |
| `workspace/products-need-real-image.csv` | Pending owner image upload list | Keep | Current |
| `workspace/manual-review-size-matched.csv` | Likely completed price apply input | Archive after verification | Later |
| `workspace/manual-review-needed.csv` | Possible superseded source file | Review/archive | Later |

## Dependency Risks To Avoid

1. Do not archive active taxonomy artifacts while Claude is validating B1.
2. Do not edit `workspace/DEV_MASTER.md` while Claude has it modified.
3. Do not follow `apps/web/MEMORY.md` over `/root/CLAUDE.md`, `AGENTS.md`, and `.agent-memory/MEMORY.md`.
4. Do not rerun mutating scripts from `workspace/scripts/active/` unless the owner explicitly approves and a fresh dry-run exists.
5. Do not move or rename runtime files under `apps/web/src` as a hygiene task.
6. Do not touch checkout/cart/payment/order/customer/stock/price logic during cleanup.
7. Do not read or copy `.env.local` or env backups into reports.
8. Do not create new root-level scratch files; use `workspace/audit/active/` for current reports.

## Recommended Reorganization Order

1. Wait for Claude to finish the live/current taxonomy and DEV_MASTER update.
2. Run `git status --short --branch` and confirm no unrelated dirty files except the intended cleanup.
3. Update `workspace/SEO_MASTER.md` so M5 taxonomy work reflects the completed 2026-05-15 apply, or explicitly says "verification only remains."
4. Update active instructions that still reference root `workspace/SEO_TODO.md`; point to `workspace/SEO_MASTER.md` and the archived source audit.
5. Archive completed taxonomy CSVs into a dated archive folder with a short README/manifest.
6. Archive or mark historical the duplicate `workspace/audit/active/SESSION-LOG.md`.
7. Move completed temporary mutator scripts out of `workspace/scripts/active/`.
8. Update `workspace/docs/ARCHIVE-INDEX.md` to match the actual archive and active script state.
9. Standardize output paths in remaining active scripts.
10. Review old app-root docs (`apps/web/MEMORY.md`, `RESUME.md`, `DECISIONS.md`, `LIVE-SOURCE-OF-TRUTH.md`) and either merge useful facts into `.agent-memory/` or archive them.
11. Run a fresh read-only `product-seo-audit.php` after the taxonomy/data batch settles.

## What Not To Reorganize First

- Do not start with `apps/web/src/` refactors. The runtime app is logically grouped enough.
- Do not start with layout/header/footer/homepage cleanup. That would become UI work, not workspace hygiene.
- Do not start by deleting old docs without a manifest. Some stale docs still contain useful historical recovery context.
- Do not start by broad-moving CSVs while price/image/product data review is in progress.

## Final Assessment

The codebase can keep functioning naturally without a structural refactor. The priority is to clean the operating surface around it: update stale master docs, archive completed generated outputs, keep active scripts honest, and prevent old memory files from contradicting current deploy law.

The next safe cleanup should be documentation and workspace-only. No app runtime code needs to move for this hygiene pass.
