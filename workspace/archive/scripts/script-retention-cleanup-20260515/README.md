# Archived Scripts — 2026-05-15 Retention Cleanup

These scripts were moved from `workspace/scripts/active/` on 2026-05-15 per the retention audit at:
`workspace/audit/active/workspace-script-retention-audit-20260515.md`

Reason each was archived:

| Script | Reason |
|--------|--------|
| `apply-woocommerce-sale-price-clear.php` | Dangerous — forces apply with no flag. Task completed 2026-05-08. |
| `clear-woocommerce-sale-prices.php` | Broad price mutation. Task completed 2026-05-08. |
| `fix-non-korean-korea-import-copy.php` | Completed 2026-05-14 (908 non-Korean products fixed). |
| `assign-emart-combos-category.php` | One-off. Input CSV missing. |
| `classify-brand-size-skipped.php` | One-off. Input CSV missing. |
| `duplicate-deep-analysis.php` | One-off. Input CSV missing. |
| `duplicate-trash-dry-run.php` | One-off. Input CSV missing. |
| `duplicate-trash-apply.php` | One-off. Input CSV missing. Mutates products. |
| `duplicate-swap-fix.php` | Hardcoded 8 product IDs. Unsafe to leave active. |
| `pa-origin-gap-dry-run.php` | Superseded by `audit-wrong-korea-origin-products.php`. Stale input paths. |
| `build-open-image-review-audit.mjs` | Old 2026-05-03 pipeline. All inputs archived/missing. |
| `targeted-product-image-ocr.mjs` | Old OCR pipeline. Inputs archived/missing. |
| `verify-deployment.sh` | Used raw IP `http://5.189.188.229` which is now removed. Needs rewrite before reuse. |

These are retained for historical reference only. Do not run without updating input paths and owner approval.
