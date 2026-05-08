# Catalog Sale Price Cleanup

On 2026-05-08, WooCommerce sale prices were cleared catalog-wide at the backend level.

- Cleared `_sale_price`, `_sale_price_dates_from`, and `_sale_price_dates_to` for all product and variation records, including 9 trashed products that still had stale sale meta.
- Verified `_price` matches `_regular_price` for products/variations with regular prices.
- Verified `wc_get_product_ids_on_sale()` returns `0`.
- CSV backups were written under `workspace/audit/archive/sale-price-backup-*.csv`.
- Homepage Flash Sale had a frontend fallback bug: when Woo returned no sale products, `apps/web/src/app/page.tsx` fell back to popular products and `FlashSaleBanner` showed duplicate current/old prices. Commit `d23c37e` removed that fallback and only renders old crossed price when a real `sale_price` exists.

Do not reintroduce fallback products into the Flash Sale banner unless Woo sale data exists again.
