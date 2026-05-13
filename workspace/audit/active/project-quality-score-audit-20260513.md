# Project Quality Score Audit - 2026-05-13

Scope: read-only audit of Emart web + mobile project quality, site quality, UI/UX consistency, SEO, and content. No source edits, deploy, VPS restart, Woo mutations, or mobile release changes were made.

## Scores

| Area | Score | Read |
| --- | ---: | --- |
| Coding quality | 78/100 | Web build/lint pass, but mobile still has direct Woo REST credential architecture and web has several maintainability/data-trust risks. |
| Site quality | 80/100 | Live samples return 200 with good security headers; mobile LCP and product-data truthfulness need attention. |
| UI/UX consistency | 75/100 | Mobile-first commerce UX is strong, but visual tokens/radius/color systems are mixed and PDP trust facts are inconsistent. |
| SEO technical | 82/100 | Metadata/schema/robots/canonicals are mostly solid; sitemap duplicates and GSC/index cleanup remain. |
| Content quality | 72/100 | Homepage/category trust copy is useful; product copy/meta still has weak/generic rows and some generated content. |
| Overall | 77/100 | Good foundation; next gains come from data truth, sitemap de-dupe, mobile security, CWV, and content cleanup. |

## Verification Run

- `git status --short`: untracked `workspace/audit/active/cwv-mobile-lcp-homepage-audit-20260512.md`; unexpected modified `apps/web/src/app/shop/page.tsx` existed/appeared during audit and was not edited by Codex.
- `cd apps/web && npm run lint`: passed with 1 warning in `src/components/categories/LiveTickerBar.tsx`.
- `cd apps/web && npm run build`: passed; Next.js route table generated successfully.
- Live status/header checks passed for:
  - https://e-mart.com.bd/
  - https://e-mart.com.bd/robots.txt
  - https://e-mart.com.bd/sitemap.xml
  - https://e-mart.com.bd/category/sunscreen
  - https://e-mart.com.bd/brands/cosrx
  - https://e-mart.com.bd/shop/cosrx-advanced-snail-mucin-96-power-essence-30ml

## Strong Points

- Next.js public SEO surface is active: homepage, product, category, brand, robots, and sitemap are served from the frontend.
- Product/category/brand pages use server metadata and clean canonical URLs.
- Product pages output Product + Offer JSON-LD and BreadcrumbList JSON-LD from live product data.
- Live sampled HTML does not expose public WordPress/PHP discovery headers.
- Header/search/cart/category navigation are rich and mobile-first.
- Old `/product/*` migration appears technically fixed in the latest P0 audit; GSC lag remains likely.

## Highest-Risk Findings

1. **Mobile security architecture risk**
   - `apps/mobile/src/config/api.js` reads `REACT_APP_WOO_CONSUMER_KEY` and `REACT_APP_WOO_CONSUMER_SECRET`.
   - `apps/mobile/src/services/woocommerce.js` sends Woo credentials in query strings and can create orders/reviews directly against `/wp-json/wc/v3`.
   - This violates the project invariant that mobile must use secure BFF/API routes, not bundled Woo credentials.

2. **PDP visible facts can be fake or mismatched**
   - `apps/web/src/components/product/ProductInfo.tsx:408` shows `SKU-{product.id}` instead of the real Woo SKU.
   - `apps/web/src/components/product/ProductInfo.tsx:412` shows `{product.stock_quantity || 6} Pcs Available`, so null/unknown stock becomes `6`.
   - This is a trust, conversion, Merchant Center, and schema/content consistency risk.

3. **Live sitemap has duplicate canonical URLs**
   - Live `/sitemap.xml`: 4,500 `<loc>` entries, 4,177 unique URLs.
   - Duplicates: 167 URLs, 323 extra duplicate entries.
   - Examples: `/shop/klairs-all-day-airy-sunscreen-50ml`, `/shop/dove-baby-wipes-sensitive-moisture-50-pcs`, `/shop/farlin-baby-wet-wipes-anti-rash-85-pcs`.

4. **Product content/data still needs Week 2 triage**
   - Existing product SEO audit totals: 319 weak meta descriptions, 19 missing Rank Math meta, 119 missing SKU, 7 invalid SKU, 19 missing brand, 1 missing image, 3 missing price, 19 thin visible descriptions, 23 merchant-schema-not-ready.
   - This lowers content and merchant-listing readiness even though the technical SEO shell is good.

5. **Empty/error brand pages can stay indexable**
   - `apps/web/src/app/brands/[slug]/page.tsx` catches product fetch errors and can render "No products found for this brand" without noindex/notFound.
   - Confirmed empty brands should not become thin indexable pages.

6. **Mobile Core Web Vitals needs a small performance pass**
   - Existing CWV report shows GSC mobile LCP group around 4.1s.
   - Likely first fix: remove below-the-fold homepage product-card `priority` image hints, keep hero priority.

7. **Build does not enforce lint**
   - `apps/web/next.config.js:10` has `eslint: { ignoreDuringBuilds: true }`.
   - Separate lint currently passes, but CI/deploy quality depends on remembering to run lint.

8. **Image alt text is inconsistent with SEO rule**
   - `ProductCard` uses product name only.
   - `ProductImage` uses image alt or product name.
   - Project SEO rule wants `{ProductName} - Emart Skincare Bangladesh`.

9. **UI design system is mixed**
   - Current UI blends `accent`, legacy `lumiere`, gray/blue inline utility colors, 8px/12px/16px/22px/24px radii, and manual SVG social icons.
   - The UX is usable, but consistency score is held down by token drift and mixed component styles.

10. **Content claims need source discipline**
   - Homepage/category/brand copy uses strong authenticity language and review/order counts.
   - Keep these only if the business can substantiate them with current internal evidence; otherwise soften claims to verified process language.

## Prioritized Next Actions

1. Replace mobile direct Woo REST calls with secure web BFF/API routes before any production mobile release.
2. Fix PDP visible SKU/stock to show only real Woo values; hide unknown stock quantity instead of defaulting to `6`.
3. De-dupe sitemap entries before XML rendering and investigate duplicated Woo product slugs/IDs.
4. Apply the small CWV fix from `cwv-mobile-lcp-homepage-audit-20260512.md`: remove below-the-fold product image priority hints.
5. Make brand pages noindex/notFound when confirmed empty or when product fetch fails.
6. Continue Week 2 product SEO triage via dry-run reports before Woo mutations.
7. Normalize product image alt text.
8. Gradually consolidate UI tokens/radii in touched components only; avoid a broad redesign.

## Deploy Status

No deploy needed for this audit report. No live UI/source changes were made.
