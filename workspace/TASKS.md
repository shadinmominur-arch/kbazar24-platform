# Kbazar24 Task Board
Last updated: 2026-06-17 by Claude

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
| ecosystem.config.js | 2026-06-17 | `kbazar24web`, port 3003, loopback bind |
| agents.md + llms.txt | 2026-06-17 | Kbazar brand, kbazar24.com URLs |
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

---

## Owner Action Required

| Priority | Task | Notes |
|---|---|---|
| HIGH | **Rotate ADMIN_PASSWORD** | `.env.local` still has `ADMIN_PASSWORD=Emart@2024!` — change to kbazar24-specific password |
| MEDIUM | **Protect /wp-login.php** | Currently public. Add Cloudflare Access rule before running paid ads |
| MEDIUM | **Rotate courier API keys** | Pathao + Packzy keys in `.env.local` are Emart's credentials — get kbazar24-specific keys |
| MEDIUM | **Disable Cloudflare AI Crawl Control** | CF is overriding `robots.txt`. Dashboard → kbazar24.com → Security → Bots → AI Crawl Control → Disable |
| LOW | **SPF + DMARC DNS records** | `TXT @ v=spf1 include:spf.brevo.com ~all` and `TXT _dmarc v=DMARC1; p=none; rua=mailto:kbazar24.bd@gmail.com` |

---

## Agent Tasks (no owner input needed)

| Priority | Task | Notes |
|---|---|---|
| HIGH | **Product sitemap** | GSC only sees 101 pages. Add `/sitemap/products` route so 3,500+ PDPs are indexed faster |
| MEDIUM | **Upload category images** | Most categories show no image in storefront. Upload via WP Admin → Products → Categories |
| LOW | **CLAUDE.md for kbazar24** | Create project-specific `CLAUDE.md` with kbazar24 paths, process names, safety rules |
| LOW | **Align @next/third-parties** | `next@14.2.35` + `@next/third-parties@16.2.x` — pin `@next/third-parties@14.x` |

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
| WooCommerce BFF | ✅ 127.0.0.1:8082, returns 200 |
| GitHub HEAD | ✅ `a027eeb` |
