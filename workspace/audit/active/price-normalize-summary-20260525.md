# Price Normalize Summary — 2026-05-25

## Dry Run

Output CSV:

- `workspace/audit/active/price-normalize-dry-run-20260525.csv`

Query run against WooCommerce:

```sql
SELECT p.ID, p.post_title, pm.meta_value AS price
FROM wp4h_posts p
JOIN wp4h_postmeta pm ON pm.post_id = p.ID AND pm.meta_key = '_regular_price'
WHERE p.post_type = 'product' AND p.post_status = 'publish'
AND CAST(pm.meta_value AS DECIMAL(10,2)) IN (0.00, 1.00)
ORDER BY CAST(pm.meta_value AS DECIMAL(10,2)), p.post_title;
```

Result:

- Published products with `_regular_price` placeholder `0.00` or `1.00`: `0`
- Products fixed: `0`
- Products drafted: `0`
- Product IDs changed: none

## Verification

Follow-up count query returned:

```text
placeholder_count
0
```

No WooCommerce database writes were needed.
