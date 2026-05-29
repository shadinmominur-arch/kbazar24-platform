# Phase A.5 Cleanup Deploy — 2026-05-29

Phase A.5 frontend cleanup was completed, built, deployed, and smoke-tested on live.

Commit:
- `58208f58fdfd89d75ae9a312ecd101249aaba46a` — `fix(web): deploy phase a.5 cleanup`
- Branch pushed: `origin/feat/atomic-refactor`

Scope completed:
- Shared real catalog count source now drives homepage, `/shop`, `/brands`, and category/brand public summaries. Old hardcoded product-count copy such as `12,000+ products` is removed.
- PDP empty content handling now hides empty Description/Ingredients/How-to-use sections instead of rendering weak fallback text.
- Homepage Best Sellers/New Arrivals duplicate crawler-visible product rail markup was collapsed to one semantic list while preserving responsive visual behavior.
- Promo/header polish fixed duplicate/awkward copy, `Ends in Ends`, and public-facing `edit` wording.
- Canonical query cleanup strips `srsltid`; `/shop/[slug]` and `/category/[slug]` canonical logic was preserved.
- Private/utility noindex behavior and fallback UI were checked for `/account`, `/checkout`, `/wishlist`, `/track-order`, and `/order-success`.
- Delivery wording was centralized through store policy copy; footer year remains dynamic.
- Product concern chips and FAQ concern text now use actual `pa_concern` data only, avoiding generic unrelated concern mapping.

Verification:
- Local and VPS `npm run build` passed.
- Live smoke passed for `/`, `/shop`, `/brands`, `/categories`, `/track-order`, `/order-success`, COSRX Salicylic Acid Daily Gentle Cleanser PDP, and CeraVe Moisturizing Cream PDP.
- `emartweb` PM2 was restarted only after VPS build passed. WordPress/WooCommerce services and `emart-presence` were not restarted.
- No WooCommerce product data was mutated. No Phase B flags were enabled. No price/sale logic was changed.
- Spot-checked live product schema prices against Woo `_price`: COSRX `950`, CeraVe cream `3388`.

Audit output:
- Product mismatch audit report: `workspace/audit/active/product-data-mismatch-audit-20260529-124704.md`
- CSV: `workspace/audit/active/product-data-mismatch-audit-20260529-124704.csv`
- Published products scanned: 3,640
- Mismatch rows found: 144
- COSRX Salicylic Acid Daily Gentle Cleanser was verified consistent as `150ml`; any `50ml` text seen in raw PDP HTML came from `150ml` substrings or related products, not a COSRX product mismatch.

Remaining issues:
- Woo-data-only cleanup remains for the 144 mismatch audit rows; owner review is required before any bulk product data change.
- PDP content gaps remain Woo-data-only; frontend now avoids publishing weak empty-section text.

Deployment note:
- A broad rsync `--delete` dry run showed production-only/stale-metadata files in `/var/www/emart-platform`, so deployment used file-scoped rsync of the committed Phase A.5 files only.
- Local status after deploy still had pre-existing untracked `apps/web/.agent-memory/emart-product-content-fields.php`; it was left untouched.
