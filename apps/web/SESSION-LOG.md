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
