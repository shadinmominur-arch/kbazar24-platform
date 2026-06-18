# Kbazar24 Task Board
Last updated: 2026-06-18 by Codex

## Coordination

- Open this project at `/root/kbazar24-platform` separately (not inside emart-platform).
- GitHub: `git@github-kbazar:shadinmominur-arch/kbazar24-platform.git` — uses dedicated SSH key `~/.ssh/id_ed25519_kbazar`.
- Deploy: `./deploy.sh` from `/root/kbazar24-platform` — has safety check to refuse if wrong repo.
- Before editing: `git status --short` and check `tail -20 apps/web/SESSION-LOG.md`.

---

## Done (setup + rebrand sessions)

| Task | Completed | Notes |
|---|---|---|
| Domain + SSL | 2026-06-16 | kbazar24.com live, Let's Encrypt cert, Cloudflare proxied |
| WordPress clone | 2026-06-16 | DB `kbazar24_wp`, prefix `wp4h_`, user `kbazar24_user` |
| Next.js brand config | 2026-06-16 | companyProfile, siteUrl, seo.ts, robots, manifest |
| Kbazar logo + icons | 2026-06-16 | kbazar-logo.png, all PWA icon sizes, favicon |
| PM2 process | 2026-06-16 | `kbazar24web` on port 3003 |
| Nginx routing | 2026-06-16 | SSL block on kbazar24, PHP on port 8082 |
| WooCommerce BFF routing | 2026-06-17 | Port 8082 internal; `WOO_INTERNAL_URL=http://127.0.0.1:8082` |
| wp-admin 403 fix | 2026-06-17 | `index index.php` added to wp-admin location block |
| Product image URLs | 2026-06-17 | 58k+ DB rows: e-mart.com.bd → kbazar24.com |
| next.config.js domain | 2026-06-17 | remotePatterns + CSP updated to kbazar24.com |
| GitHub repo | 2026-06-17 | `shadinmominur-arch/kbazar24-platform`, SSH key wired |
| deploy.sh | 2026-06-17 | Points to kbazar24 paths/process, repo safety check |
| ecosystem.config.js | 2026-06-17 | `kbazar24web`, `next start -H 127.0.0.1 -p 3003`; PM2 verified loopback-only |
| agents.md + llms.txt | 2026-06-17 | Kbazar brand, kbazar24.com URLs |
| Root agent docs | 2026-06-17 | `AGENTS.md` and `CLAUDE.md` replaced with Kbazar-specific operating rules |
| Package metadata | 2026-06-17 | `package.json` identifies Kbazar; `@next/third-parties` aligned to Next 14.2.35 |
| Public contact links | 2026-06-17 | Old Emart WhatsApp/support numbers replaced with Kbazar `01723659703` in tracked frontend files |
| WP admin IP allowlist | 2026-06-17 | `/wp-login.php` + `/wp-admin` restricted to owner IP `103.197.153.14`; normal WordPress login works for owner, other IPs get 403 |
| Woo error log sanitizing | 2026-06-17 | Category cache fetches throw sanitized messages instead of dumping Axios/Woo config |
| Google Search Console | 2026-06-17 | Verified, sitemap submitted (101 pages read) |
| GA4 | 2026-06-17 | `G-04N4N3WFMK` live in build |
| Meta Pixel | 2026-06-17 | `780968206134070` live in build (kbazar.bd pixel) |
| Bulk Emart→Kbazar content replace | 2026-06-17 | 3,539 product descriptions + 3,643 SEO metas; backup `/root/kbazar24-pre-rebrand-20260617-0029.sql` |
| WooCommerce API key rotation | 2026-06-17 | Fresh keys `ck_e069.../cs_c3a1...`; BFF smoke 200 ✅ |
| Customer data deletion | 2026-06-17 | 2,042 orders, 2,767 users, 898 subscribers, ZBS CRM, reviews deleted; backup `/root/kbazar24-pre-cleanup-20260617.sql` |
| Google-visible Emart references | 2026-06-17 | Blog slug, CSS classes, author nicename, ingredient pages, feeds, header block all cleaned |
| Blog author name | 2026-06-17 | `emartadmin` → `Kbazar Team`; login → `kbazar24admin` |
| Mixed content warning fix | 2026-06-17 | Contact form `<form action="mailto:">` → `ContactForm.tsx` client component |
| Shop preload warning fix | 2026-06-17 | Removed `priority` from shop listing `ProductCard` |
| Brand name standardised | 2026-06-17 | `Kbazar - Korean Cosmetics Store` everywhere; homepage title `... \| Bangladesh` |
| Footer/logo media cleanup | 2026-06-18 | All app/runtime/WP PNG logo files normalized to the same Kbazar PNG hash; old `/2026/03/logo*.png`, `/2026/06/emart-logo*.png`, and `/2026/06/logo-4*.png` upload variants replaced |
| GSC old product redirects batch 1 | 2026-06-18 | Added 16 conservative old PDP redirects plus `/product/*` variants from inherited GSC export; deployed commit `25adfda`, live 308 spot checks passed |
| GSC 180-day product redirect import | 2026-06-18 | Service account access confirmed; reviewed 209 GSC product URLs from the last 180 days and deployed 22 changed-slug `/product/*` redirects. Runtime build passed, PM2 restarted, live redirect spot checks passed |
| GSC sitemap submission | 2026-06-18 | Submitted `https://kbazar24.com/sitemap.xml` and `https://kbazar24.com/news-sitemap.xml` via Search Console API; main sitemap has 4,213 URLs, including 3,625 product URLs, with 0 errors and 0 warnings |
| IndexNow full URL submission | 2026-06-18 | Existing root key file verified live; submitted all 4,213 sitemap URLs. Bing returned 200, Yandex returned 202 success, central `api.indexnow.org` returned 200 after key verification completed |
| GSC indexing audit + Purito soft-404 fix | 2026-06-18 | GSC samples show homepage/shop/face-cleansers indexed with matching canonicals. Added exact redirect for old Purito `/product/...serum-60ml` Soft 404 to canonical `/shop/...unscented-60ml`; resubmitted sitemaps and pinged IndexNow |
| Checkout order auth fix | 2026-06-18 | Next checkout now sends both `X-Emart-Secret` and `X-Kbazar-Secret` to the existing WordPress order endpoint. Runtime build passed, `kbazar24web` restarted, and auth probe changed from 403 Forbidden to payload validation |
| Full public Emart residue audit | 2026-06-18 | Removed tracked/runtime `/images/brands-e-mart`, added first-priority `/favicon-48x48.png`, renamed 2,431 old WP upload filenames, cleaned public WP posts/postmeta/Elementor/SEO/invoice strings to 0 old-brand matches, clean rebuilt runtime, and submitted refreshed sitemap/logo/favicon URLs |

---

## Owner Action Required

| Priority | Task | Notes |
|---|---|---|
| HIGH | **Rotate ADMIN_PASSWORD** | `.env.local` still has `ADMIN_PASSWORD=Emart@2024!` — change to kbazar24-specific password |
| HIGH | **Rotate GSC service-account key** | A previous key was exposed in chat. Current runtime key works, but replace/revoke exposed credentials in Google Cloud after confirming imports are complete |
| MEDIUM | **Add Cloudflare Access for WP admin** | Nginx owner-IP allowlist is active now. Cloudflare Access would add a more flexible edge-layer control before paid ads |
| MEDIUM | **Rotate courier API keys** | Pathao + Packzy keys in `.env.local` are Emart's credentials — get kbazar24-specific keys |
| MEDIUM | **Disable Cloudflare AI Crawl Control** | CF is overriding `robots.txt`. Dashboard → kbazar24.com → Security → Bots → AI Crawl Control → Disable |
| LOW | **SPF + DMARC DNS records** | `TXT @ v=spf1 include:spf.brevo.com ~all` and `TXT _dmarc v=DMARC1; p=none; rua=mailto:kbazar24.bd@gmail.com` |

---

## Agent Tasks (no owner input needed)

| Priority | Task | Notes |
|---|---|---|
| HIGH | **Monitor GSC product indexing** | Main sitemap is submitted with 3,625 product URLs. Homepage, `/shop`, and `/category/face-cleansers` are indexed; sampled Purito PDP is not yet indexed/unknown to Google. Recheck after recrawl and validate fixed Soft 404 group in GSC UI |
| MEDIUM | **Upload category images** | Most categories show no image in storefront. Upload via WP Admin → Products → Categories |
| LOW | **Tune PHP-FPM capacity** | Logs showed `pm.max_children` warnings during Woo/API load. Check memory headroom before increasing |

---

## Runtime Health (as of 2026-06-17)

| Check | Status |
|---|---|
| Home `https://kbazar24.com/` | ✅ 200 |
| Shop `/shop` | ✅ 200, no preload warnings |
| Category `/category/face-cleansers` | ✅ 200 |
| Contact `/contact` | ✅ 200, no mixed-content warning |
| wp-admin `/wp-admin/` | ✅ 302 → wp-login.php |
| WP REST API `/wp-json/` | ✅ 404 (not exposed) |
| Sitemap `/sitemap.xml` | ✅ 200 |
| GA4 `G-04N4N3WFMK` | ✅ In build bundle |
| Meta Pixel `780968206134070` | ✅ In build bundle |
| PM2 `kbazar24web` | ✅ Online, port 3003 |
| PM2 bind address | ✅ `127.0.0.1:3003` only |
| WP login from non-owner IP | ✅ 403 blocked by Nginx allowlist |
| WP login from owner IP | ✅ Allowed to use normal WordPress login |
| WooCommerce BFF | ✅ 127.0.0.1:8082, returns 200 |
| GitHub HEAD | ✅ `c606ef4` pushed after Kbazar PNG logo normalization |
