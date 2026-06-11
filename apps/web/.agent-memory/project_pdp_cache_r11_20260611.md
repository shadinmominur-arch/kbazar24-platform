---
name: project_pdp_cache_r11_20260611
description: R11 PDP Nginx cache headers added 2026-06-11; Cloudflare edge TTL appears to ignore origin headers (forced ~1hr) on /shop/* and /category/*
metadata:
  type: project
---

R11 (audit H-01 stage 1): added Nginx location `~ ^/shop/[^/]+/?$` in
`/etc/nginx/sites-enabled/emart-nextjs` (after `location = /shop`),
matching the existing `/category/[slug]` and `/brands/[slug]` pattern —
emits `Cache-Control: public, s-maxage=300, stale-while-revalidate=600`,
`CDN-Cache-Control: public, s-maxage=300`, `Cloudflare-CDN-Cache-Control:
public, s-maxage=300`, hiding Next.js's `private, no-store` (force-dynamic)
header. Backup: `/etc/nginx/sites-available/emart-nextjs.backup-20260611-pdp-cache`.
Origin-verified via `127.0.0.1` + Host header — correct.

**Discovery — Cloudflare cache rule (owner item #4, applied 2026-06-11)
appears to ignore origin Cache-Control entirely:**
- `/category/serums-ampoules-essences`: live `cache-control: public,
  s-maxage=300, stale-while-revalidate=600` but `age: 1714` (28.5min) with
  `cf-cache-status: HIT` — way past the 300+600=900s window.
- PDP `boom-de-ah-dah-squalane-moisture-ampoule-50ml`: `age: 2151`,
  `cf-cache-status: HIT`, but cache-control is still the OLD pre-R11
  `private, no-cache, no-store, max-age=0, must-revalidate` — meaning
  Cloudflare cached this PDP HTML *despite* origin saying no-store, and
  is still serving it ~36min later.

Both ages are <3600s, consistent with a forced **1hr Edge Cache TTL**
applied broadly to `/shop/*` (incl. PDPs) + `/category/*`, NOT
"respect origin headers" as the audit recommended. Net effect: PDP
price/stock/availability display (and Product JSON-LD) can be up to
~1hr stale at the edge. Checkout still re-validates stock/price
server-side ([[project_checkout_order_endpoint_20260606]] /
`normalizeStockAvailability`), so this is a display/SEO-freshness risk,
not an overselling risk.

**Open owner decision:** scope the Cloudflare cache rule to exclude
`/shop/{slug}` (let Nginx's `s-maxage=300` + "respect origin headers"
govern PDPs, ~5min staleness) vs. accept ~1hr PDP display staleness
site-wide. See [[project_seo_openclaw_audit_20260608]] and TASKS.md R11.
