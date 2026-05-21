# Audit Workspace

All audit files live here. Active items with pending decisions go in `active/`. Completed items move to `archive/` with a dated subfolder.

Do not store durable memory, raw imports, screenshots, or one-off scratch files here.

---

## Active (`active/`)

| File | What it is | Next action |
|------|-----------|-------------|
| `pa-concern-dry-run-20260521-171429.csv` | pa_concern dry-run results | Review and apply via `pa-concern-apply.py` |
| `pa-concern-dry-run-20260521-171429-summary.txt` | Summary of above dry-run | — |
| `pa-concern-manual-review-20260521-174247.csv` | Manual review candidates from pa_concern run | Owner review required |
| `pa-origin-gap-review-20260521-175120.csv` | Products with missing/mismatched pa_origin | Owner review required |
| `404-redirect.xlsx` | GSC 404 URLs to be implemented as redirects in `next.config.js` | Cross-ref with GSC report → add redirects |
| `manual-review-size-notmatched.csv` | Emart vs Emartwayskincare size mismatches flagged for review | Owner review required |
| `products-need-real-image.csv` | Products with no real product image | Owner review required |

## Archive (`archive/`)

Completed runs are moved here with dated filenames. Do not delete — keep for rollback reference.
