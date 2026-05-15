# P0 Product URL Migration Audit - 2026-05-11

Scope: read-only Week 2 SEO P0 audit for old Woo/Woodmart `/product/*` URLs resolving to clean Next.js `/shop/*` product URLs.

## Redirect Sources Checked

| File / source | Finding |
| --- | --- |
| `apps/web/next.config.js` | General permanent redirect exists: `/product/:slug` -> `/shop/:slug`. Additional specific stale duplicate product slug redirects also exist for old `-2` style URLs. |
| `apps/web/src/middleware.ts` | Middleware strips noisy query parameters and handles selected gone paths. It does not own the `/product/*` to `/shop/*` migration. |
| `workspace/audit/*`, `workspace/scripts/*` | Historical audit/script references exist, but current live redirect authority is `apps/web/next.config.js`. |

## Live Sample Results

| Old URL | Status chain | Final URL status | Final canonical | Final title | Robots | Sitemap presence | Classification |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/product/cerave-skin-renewing-night-cream-48g/` | `301 https://e-mart.com.bd/product/cerave-skin-renewing-night-cream-48g/` -> `https://e-mart.com.bd/shop/cerave-skin-renewing-night-cream-48g`; then `200` | `200 https://e-mart.com.bd/shop/cerave-skin-renewing-night-cream-48g` | `https://e-mart.com.bd/shop/cerave-skin-renewing-night-cream-48g` | `CeraVe Skin Renewing Night Cream 48g Price in Bangladesh | Emart` | `index, follow` | Clean `/shop/` URL present; old `/product/` URL absent | A - already fixed, waiting for Google |
| `/product/skin1004-madagascar-centella-light-cleansing-oil-30ml/` | `301 https://e-mart.com.bd/product/skin1004-madagascar-centella-light-cleansing-oil-30ml/` -> `https://e-mart.com.bd/shop/skin1004-madagascar-centella-light-cleansing-oil-30ml`; then `200` | `200 https://e-mart.com.bd/shop/skin1004-madagascar-centella-light-cleansing-oil-30ml` | `https://e-mart.com.bd/shop/skin1004-madagascar-centella-light-cleansing-oil-30ml` | `SKIN1004 Madagascar Centella Light Cleansing Oil 30ml Price in Bangladesh | Emart` | `index, follow` | Clean `/shop/` URL present; old `/product/` URL absent | A - already fixed, waiting for Google |
| `/product/innisfree-super-volcanic-pore-clay-mask-100ml/` | `301 https://e-mart.com.bd/product/innisfree-super-volcanic-pore-clay-mask-100ml/` -> `https://e-mart.com.bd/shop/innisfree-super-volcanic-pore-clay-mask-100ml`; then `200` | `200 https://e-mart.com.bd/shop/innisfree-super-volcanic-pore-clay-mask-100ml` | `https://e-mart.com.bd/shop/innisfree-super-volcanic-pore-clay-mask-100ml` | `Innisfree Super Volcanic Pore Clay Mask 2X 100ml Price in Bangladesh | Emart` | `index, follow` | Clean `/shop/` URL present; old `/product/` URL absent | A - already fixed, waiting for Google |

## Interpretation

The sampled old `/product/*` URLs are not live canonical issues. They permanently redirect to the expected clean `/shop/*` URLs, the final pages are indexable, product titles follow the current Next.js title authority pattern, and the clean canonical product URLs are present in `https://e-mart.com.bd/sitemap.xml`.

GSC top-page visibility for these old URLs is most likely lag from Google's recrawl/reprocessing cycle rather than an active migration bug for the sampled URLs.

## Code Change Needed

No code change is needed for the sampled URLs.

If later GSC exports reveal failing old product URL samples, the exact file to inspect/change first is:

- `apps/web/next.config.js` for redirect coverage or stale-slug exceptions.

Do not change Woo data, checkout/cart/payment/order, mobile app, sitemap policy, or deploy state based on this sampled audit alone.
