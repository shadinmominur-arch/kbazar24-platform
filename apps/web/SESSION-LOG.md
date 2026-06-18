# Kbazar24 Session Log

## 2026-06-16 (Codex - project memory bootstrap + VPS audit)

- User asked to audit the new Kbazar project on the VPS and then create separate log/memory/taskboard for Kbazar while Claude may also be working.
- Found Kbazar source at `/root/kbazar24-platform`, runtime at `/var/www/kbazar24-platform`, WordPress backend at `/var/www/kbazar24-wp`, and PM2 process `kbazar24web`.
- Confirmed the app is an Emart fork with many inherited docs, deploy settings, repo remotes, public SEO/LLM files, mu-plugin names, and internal identifiers.
- Ran `npm run build` in `/root/kbazar24-platform/apps/web`; build passed, but Woo/category/product fetches emitted repeated 8-second timeout warnings during page generation.
- Live smoke checks: `/`, `/shop`, `/category/face-cleansers`, `/robots.txt`, and `/sitemap.xml` returned 200. Public `/agents.md` and `/llms.txt` still describe Emart and link to `e-mart.com.bd`.
- Security/ops findings: `.env.local` is ignored but contains live-looking secrets that should be rotated; `/wp-login.php` is public; public `/wp-json` behavior differs from loopback backend; `kbazar24web` should bind to loopback; Kbazar deploy script/config still target Emart.
- Created Kbazar-specific active state files: `workspace/TASKS.md`, `apps/web/SESSION-LOG.md`, and `apps/web/.agent-memory/MEMORY.md`; inherited Emart versions should be preserved as timestamped backups.
- Blockers: none for documentation bootstrap. Next step: fix Kbazar deploy/PM2 config before using any one-command deploy flow.

## 2026-06-17 (Claude - API routing fix, image URL migration, GitHub repo)

**Did:**
- Fixed WooCommerce internal BFF routing: added dedicated Nginx server on `127.0.0.1:8082` for kbazar24-wp; updated `WOO_INTERNAL_URL=http://127.0.0.1:8082` in `.env.local` on both Local and VPS. Root cause was kbazar24's port-80 redirect block taking priority over the wordpress sites-available file (alphabetical load order). Enabled `sites-available/wordpress` symlink in `sites-enabled/`.
- Fixed wp-admin 403: added explicit `index index.php;` to the wp-admin location block in `/etc/nginx/sites-available/kbazar24`. WordPress admin now correctly redirects to wp-login.php.
- Migrated product image URLs: ran WP-CLI search-replace replacing `https://e-mart.com.bd` → `https://kbazar24.com` across all DB tables (58,155 replacements + 13 http:// variants). Uploads directory already contained full image set from DB clone.
- Fixed Next.js image config: updated `remotePatterns`, `img-src` CSP, and `connect-src` CSP in `next.config.js` from `e-mart.com.bd` → `kbazar24.com`. Rebuilt and deployed new build to VPS. Revalidated `products` and `categories` ISR cache tags.
- Set up GitHub repo `shadinmominur-arch/kbazar24-platform`: generated new SSH key `~/.ssh/id_ed25519_kbazar`, added `Host github-kbazar` alias to `~/.ssh/config`, updated remote URL, pushed initial brand commit `e95a32d`.

**Blockers:** None.
**Next step:** Fix deploy.sh, ecosystem.config.js, agents.md, llms.txt — all still reference Emart.

## 2026-06-17 (Claude - GA4 + Meta Pixel + final audit)

**Did:**
- Added GA4 `G-04N4N3WFMK` to `.env.local` (both Local and VPS), rebuilt on VPS, restarted `kbazar24web`. Verified ID in bundle.
- Added Meta Pixel `780968206134070` (kbazar.bd pixel, Business `884487198777585`) to `.env.local`, rebuilt, restarted. Verified in bundle.
- Audited DB for remaining Emart brand residue: 0 product titles contain "Emart" ✅, but 3,539 product descriptions and 3,643 SEO meta descriptions still contain "Emart" — owner confirmation required before bulk replace.
- Found Emart category terms still in DB: `Emart Combos`, `Emart Combo`, `emart-exclusive`, `emart-skincare`, `emart-bangladesh` — need rename/delete decision from owner.
- Updated TASKS.md with full done/pending breakdown.

**Blockers:** Bulk "Emart→Kbazar" replace in product content and meta requires owner go-ahead (irreversible without backup).
**Next step:** Owner to review TASKS.md critical section; agent to run content replace + create product sitemap once confirmed.

## 2026-06-17 (Claude - bulk Emart→Kbazar content replace + WC key rotation)

**Did:**
- Owner confirmed bulk replace before Google crawl. Took 111 MB mysqldump backup of product/meta/terms tables to `/root/kbazar24-pre-rebrand-20260617-0029.sql` before any changes.
- Ran WP-CLI search-replace: `Emart Skincare Bangladesh` → `Kbazar Korean Cosmetics Store` (8,188 rows), `Emart BD` → `Kbazar` (888 rows), `Emart` → `Kbazar` (20,692 rows) across all DB tables handling serialized data safely.
- Replaced SQL CSS class `emart-skin-concern` → `kbazar-skin-concern` in 186 product post_content rows.
- Renamed DB terms: `emart-combos`→`kbazar-combos`, `emart-combo`→`kbazar-combo`, `emart-exclusive`→`kbazar-exclusive`, `emart-skincare`→`kbazar`; deleted `emart-bangladesh` and `emart-skincare-bangladesh`.
- Updated source code `emart-` prefixed localStorage/cookie/cache keys throughout `apps/web/src` (committed `7656ff9`).
- Updated `.env.local` (Local + VPS) with fresh WooCommerce API keys `ck_e069.../cs_c3a1...` provided by owner. Restarted `kbazar24web --update-env`. BFF smoke test returned HTTP 200.

**Blockers:** None.
**Next step:** Product sitemap (3,500+ PDPs not in GSC), category images, ADMIN_PASSWORD still says `Emart@2024!` — owner should rotate.

## 2026-06-17 (Claude - Google surface audit + console errors + brand name)

**Did:**
- Full Google-surface audit: found blog slug with `emart-blog-readers`, `user_nicename=emartadmin`, `emart-announcement/marquee` CSS classes in header block, WP REST API verified blocked.
- Fixed blog post slug → `kbazar-shoppers`; added 301 redirect in `next.config.js` and Rank Math DB; `user_nicename` → `kbazar24admin`.
- Renamed `emart-announcement`, `emart-marquee`, `emart-scroll` etc. CSS classes → `kbazar-` in `whb_header_328989` DB option.
- Fixed mixed-content browser warning: contact page `<form action="mailto:">` extracted into `ContactForm.tsx` client component using JS `onSubmit` + `window.location.href`.
- Fixed unused preload warning on `/shop`: removed `priority` from `ProductCard` in shop listing (SSR preload mismatched hydrated URL due to `useState` error fallback).
- Standardised brand name to `Kbazar - Korean Cosmetics Store` across `companyProfile.ts`, `layout.tsx`, `page.tsx`, `Header.tsx`, `Footer.tsx`, `ProductCard.tsx`, `seo.ts`. Homepage title: `Kbazar - Korean Cosmetics Store | Bangladesh`. Inner pages: `%s | Kbazar`.
- All 4 commits pushed to `shadinmominur-arch/kbazar24-platform` (HEAD: `a027eeb`).

**Blockers:** None.
**Next step:** Product sitemap, category images, ADMIN_PASSWORD rotation, Cloudflare AI Crawl Control disable, Pathao/Packzy key rotation.

## 2026-06-17 (Codex - Kbazar hardening + live smoke)

**Did:**
- Replaced inherited root operating docs with Kbazar-specific `AGENTS.md` and `CLAUDE.md`; rewired `deploy.sh` to `/root/kbazar24-platform`, `/var/www/kbazar24-platform`, PM2 `kbazar24web`, and `https://kbazar24.com/` smoke checks.
- Fixed `apps/web/ecosystem.config.js` to run `node_modules/.bin/next start -H 127.0.0.1 -p 3003`; deployed runtime config and verified PM2 listens only on `127.0.0.1:3003`.
- Updated package metadata and pinned `@next/third-parties` to `14.2.35`; refreshed `package-lock.json`.
- Replaced tracked frontend Emart support/WhatsApp links with Kbazar `01723659703` / `https://wa.me/8801723659703`.
- Added Nginx basic auth for `/wp-login.php`, `/wp-admin`, and `/wp-admin/`; credential note saved at `/root/kbazar24-wp-admin-basic-auth.txt` with root-only permissions. Verified unauthenticated `/wp-login.php` returns 401 and authenticated returns 200.
- Sanitized Woo category cache errors so build/runtime logs do not expose raw Axios config or Woo credentials.
- Built locally and on runtime, restarted `kbazar24web`, saved PM2, and smoke-tested live pages: `/`, `/shop`, `/category/face-cleansers`, `/agents.md`, `/llms.txt`, `/sitemap.xml`, `/robots.txt` all returned 200.

**Blockers:** None for this hardening batch.
**Next step:** Product sitemap, category images, `ADMIN_PASSWORD` rotation, courier key rotation, Cloudflare AI Crawl Control review, and PHP-FPM capacity tuning.

## 2026-06-17 (Codex - WP login access fix)

**Did:**
- User reported WordPress login was not working after admin hardening.
- Nginx logs showed the browser was submitting `emartadmin` to the HTTP basic-auth layer, so WordPress never received the normal login attempt.
- Changed `/etc/nginx/sites-available/kbazar24` admin/login protection from basic auth to owner-IP allowlist: `103.197.153.14` can reach `/wp-login.php` and `/wp-admin` directly; other IPs receive 403.
- Reloaded Nginx and verified storefront `/` and `/account` return 200; non-owner `/wp-login.php` and `/wp-admin/` return 403.

**Blockers:** Owner IP changes will require updating the Nginx allowlist.
**Next step:** Owner should retry `/wp-login.php` in a fresh/incognito tab if the browser cached the old basic-auth prompt.

## 2026-06-18 (Codex - footer logo audit)

**Did:**
- User reported mobile footer still showing old Emart logo art.
- Confirmed source, runtime, and live raw assets for `/logo.png`, `/images/logo.png`, and `/kbazar-logo.png` now serve Kbazar artwork.
- Updated footer brand image from generic `/logo.png` to explicit `/kbazar-logo.png`, matching the header logo path and avoiding old optimized-image cache ambiguity.
- Checked live optimized image URL for `/logo.png`; it now renders the Kbazar icon, so any remaining phone screenshot issue is likely browser/CDN/service-worker cache from an older render.
- Reset stale local `.next` cache by moving it to `.next.logo-check-stale-20260618`.

**Blockers:** Build finalization failed during this interim check, but the issue was resolved later the same day by a clean/warm rebuild during deploy.
**Next step:** See the later Kbazar logo source deploy entry for the completed deploy/restart/smoke.

## 2026-06-18 (Codex - WordPress logo upload cleanup)

**Did:**
- User screenshot showed old colored Emart square next to the Kbazar footer copy.
- Traced the exact old artwork to live WordPress media `https://kbazar24.com/wp-content/uploads/2026/03/logo.png`.
- Replaced `/var/www/kbazar24-wp/wp-content/uploads/2026/03/logo.png` plus `logo-600x600.png`, `logo-100x100.png`, and `logo-e1781598760158.png` with the Kbazar logo.
- Updated source metadata/JSON-LD logo references in `layout.tsx`, `about-us/page.tsx`, and `contact/page.tsx` to use `/kbazar-logo.png`.
- Verified live raw `/wp-content/uploads/2026/03/logo.png`, raw `/kbazar-logo.png`, and optimized `/_next/image?url=%2Fkbazar-logo.png&w=96&q=75` responses render Kbazar artwork.

**Blockers:** None for the live logo fix.
**Next step:** Continue R12 PDP ISR/product sitemap and R18 homepage product rail work.

## 2026-06-18 (Codex - Kbazar logo source deploy)

**Did:**
- Updated storefront source paths that could show the generic site logo or product fallback image to use `/kbazar-logo.png` explicitly, including footer, product cards, wishlist/cart fallback images, brand fallback images, and public metadata/JSON-LD logo references.
- Local `npm run build` passed after a clean/warm build retry; the deploy script also completed local build and VPS build cleanly.
- Deployed with `./deploy.sh "fix: use kbazar logo across storefront"`; PM2 process `kbazar24web` restarted, live `/` smoke returned 200, and commit `6521596` was pushed to GitHub.
- Verified `https://kbazar24.com/kbazar-logo.png` returns 200 from Cloudflare with the deployed Kbazar asset.

**Blockers:** None.
**Next step:** Resume R12 PDP ISR/product sitemap and R18 homepage product rail work.

## 2026-06-18 (Codex - PNG logo cross-check)

**Did:**
- User asked to cross-check every PNG logo and replace with Kbazar.
- Normalized app-owned logo files so `/logo.png`, `/images/logo.png`, and `/kbazar-logo.png` are all real PNG files with identical Kbazar artwork.
- Left PWA/icon PNGs intact after confirming the app icon surface already renders Kbazar.
- Replaced all WordPress uploaded logo PNG variants found under `/wp-content/uploads/2026/03/` and `/wp-content/uploads/2026/06/`, including inherited `emart-logo*.png` and `logo-4*.png`, with the same Kbazar PNG.
- Updated remaining active source references in contact metadata, RSS/feed XML, deals/new-arrivals XML, and the MailPoet updater from generic/old logo URLs to `https://kbazar24.com/kbazar-logo.png`.
- Verified local source, deployed app runtime, and WordPress logo files share hash `8cc40ee57c79c6531ac3f85ac0d7402bd135405a2ba21bac4e703486df0ea8a8`.
- Local build and deploy-script local/VPS builds passed; deployed with commit `c606ef4`, restarted `kbazar24web`, live `/` smoke returned 200, and pushed to GitHub.

**Blockers:** None. Shell DNS was intermittent for streamed live hash checks, but live HEAD checks returned 200 PNG responses and filesystem hashes match on source/runtime/WP.
**Next step:** Resume R12 PDP ISR/product sitemap and R18 homepage product rail work.

## 2026-06-18 (Codex - GSC product redirect import prep)

**Did:**
- User provided Search Console service account email `kbazar24@kbazar-1754741418372.iam.gserviceaccount.com` and asked to import old product URLs from Google and redirect them to current Kbazar pages.
- Added runtime helper `workspace/scripts/active/gsc_product_redirect_import.py` (ignored by git but synced to VPS) to pull `/shop/*` and `/product/*` pages from GSC via service-account JSON, match them to current published Woo products, and write redirect candidate CSV/snippet files.
- Confirmed the service account email alone is not enough to call GSC; `GOOGLE_SERVICE_ACCOUNT_KEY=/path/to/key.json` is required and the service account must have Search Console access to the property.
- Reviewed inherited GSC PDP 404 export `workspace/audit/active/pdp-404-redirect-map-20260615.csv`: 96 rows, 35 HIGH confidence, only 3 HIGH already active.
- Added 16 conservative old product redirects (plus `/product/*` variants) to `apps/web/next.config.js`, avoiding obvious cross-size/cross-shade review rows.
- Local build and VPS build passed; deployed with commit `25adfda` (`fix: add GSC product redirects`), restarted `kbazar24web`, live `/` smoke returned 200, and pushed to GitHub.
- Live spot checks returned 308 to current product URLs for Beauty of Joseon cleansing oil, COSRX snail essence, and Vaseline jelly old slugs.

**Blockers:** Fresh Google import still needs the service-account JSON key on the server and Search Console property access for that service account.
**Next step:** Add the JSON key as a runtime-only file, run the importer for `https://kbazar24.com/` (and old property if available), then review/apply generated HIGH-confidence redirects.

## 2026-06-18 (Codex - GSC service account permission check)

**Did:**
- User uploaded the fresh GSC service account JSON to `/root/kbazar24-gsc-service-account.json`; verified it exists with `600` permissions without printing secret contents.
- Ran `workspace/scripts/active/gsc_product_redirect_import.py` against `https://kbazar24.com/`.
- First sandboxed run failed on DNS as expected; escalated run reached Google successfully.
- Search Console API returned 403 for `https://kbazar24.com/`: the service account does not have permission for that property.
- Ran read-only `sites.list`; the service account currently sees zero Search Console properties.

**Blockers:** Add `kbazar24@kbazar-1754741418372.iam.gserviceaccount.com` as a user on the correct Search Console property, ideally the Domain property `sc-domain:kbazar24.com` or URL-prefix property `https://kbazar24.com/`.
**Next step:** After GSC access is granted, rerun the importer and apply reviewed HIGH-confidence redirects.

## 2026-06-18 (Codex - GSC 180-day product redirect import)

**Did:**
- Rechecked Search Console service-account access after owner added it; `sites.list` now sees `https://kbazar24.com/` with `siteFullUser`.
- Queried Search Console for 180 days of `/product/*` and `/shop/*` page data and matched against current published Woo products.
- Reviewed 209 product URLs: 130 HIGH, 36 MEDIUM, 43 LOW. Most HIGH `/product/current-slug` entries are already covered by the generic `/product/:slug` redirect.
- Added 22 safe changed-slug `/product/*` redirects to `apps/web/next.config.js`, ahead of the generic `/product/:slug` rule.
- Corrected one Search Console URL containing an encoded non-breaking hyphen so it redirects to the canonical ASCII slug.
- Avoided `./deploy.sh` because the worktree has many unrelated dirty deletions; copied only `next.config.js` to `/var/www/kbazar24-platform/apps/web/`.
- Runtime `npm run build` passed twice, `pm2 restart kbazar24web` succeeded, and live smoke checks passed.
- Live checks: `/` 200, `/sitemap.xml` 200, Kerasys and Skin1004 old product URLs 308 to current product pages, encoded Purito URL 308 to canonical ASCII current product page.

**Blockers:** None for this batch. A GSC private key was previously exposed in chat, so rotate/revoke that service-account key after confirming no more immediate imports need it.
**Next step:** Add product sitemap route so Search Console can discover all PDPs faster.

## 2026-06-18 (Codex - GSC index-now submission)

**Did:**
- Pushed redirect/docs commit `65b5fdf` to GitHub.
- Verified live `https://kbazar24.com/sitemap.xml` is the full catalog sitemap, not a small fallback: 4,213 total URLs, 3,625 `/shop/*` product URLs, 50 category URLs, ~799 KB XML.
- Submitted `https://kbazar24.com/sitemap.xml` to Search Console API for `https://kbazar24.com/`; Google returned 204 and now shows the sitemap as pending with 4,213 submitted URLs, 0 warnings, and 0 errors.
- Submitted `https://kbazar24.com/news-sitemap.xml`; Google returned 204 and now shows it pending with 0 warnings and 0 errors.
- URL Inspection API check: homepage verdict `PASS`, coverage `Submitted and indexed`, robots allowed, last crawled `2026-06-18T12:17:18Z`.
- URL Inspection API check: sampled product `https://kbazar24.com/shop/skin1004-centella-hyalu-cica-water-fit-sun-serum-50ml` is `Discovered - currently not indexed`.

**Blockers:** Google does not provide instant manual indexing via the Search Console API for normal ecommerce product pages; sitemap submission queues discovery/recrawl.
**Next step:** Recheck GSC sitemap processing and product coverage after Google processes the pending sitemap.

## 2026-06-18 (Codex - IndexNow full sitemap submission)

**Did:**
- Confirmed existing IndexNow key file `https://kbazar24.com/f388fee928b456a35b6b05ea5e34dbea.txt` is live and matches the app's revalidation IndexNow key.
- Submitted all 4,213 live sitemap URLs from `/tmp/kbazar24-sitemap.xml` to IndexNow-compatible endpoints.
- Bing endpoint `https://www.bing.com/indexnow` accepted the full batch with HTTP 200.
- Yandex endpoint `https://yandex.com/indexnow` accepted the full batch with HTTP 202 and `success: true`.
- Central endpoint `https://api.indexnow.org/indexnow` first returned pending site verification, then accepted the full batch with HTTP 200 after retry.

**Blockers:** None. User provided an email address, but IndexNow does not use email for API submissions; it uses host, key, keyLocation, and URL list.
**Next step:** Monitor Bing/IndexNow insights if webmaster tooling is connected; future product/category revalidation already pings IndexNow through `/api/revalidate`.
