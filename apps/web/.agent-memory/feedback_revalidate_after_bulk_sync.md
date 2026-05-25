---
name: feedback_revalidate_after_bulk_sync
description: "After any bulk WooCommerce meta/taxonomy sync, trigger revalidateTag products or pages will serve stale ISR cache"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: af57b72d-7d82-49ee-8e6d-b9b8d3bd6b5a
---

After bulk WP/Woo data syncs (pa_origin, _structured_description, _emart_product_faq, etc.), Next.js ISR caches stale pages for up to 1 hour. Always trigger revalidation immediately after confirming the DB sync is clean.

Command:
```
SECRET=$(grep REVALIDATE_SECRET /var/www/emart-platform/apps/web/.env.local | cut -d= -f2)
curl -s https://e-mart.com.bd/api/revalidate -X POST \
  -H "Content-Type: application/json" \
  -H "x-revalidate-secret: $SECRET" \
  -d '{"tag":"products"}'
```

**Why:** Confirmed 2026-05-25 — Durex page served `Origin:Korea` live even after DB was correctly updated to `Origin:Malaysia`; `x-nextjs-cache: HIT` confirmed ISR was the cause.
**How to apply:** Add this as the final step of any Codex/Claude bulk data task that touches product meta or taxonomy.
