# pa_origin + PDP Origin Sync Applied — 2026-05-25

## Scope

Applied the corrected dry-run plan for stale product origin data.

Owner overrides:

- Bath & Body Works -> Malaysia
- Clean & Clear -> UK
- Durex -> Malaysia
- Gfors -> South Korea
- Sheglam -> Singapore
- St. Ives -> UK
- Vatika Naturals -> India
- vaseline -> UK

## Apply Counts

- `pa_origin` assignments: 80
- Custom PDP `Origin` updates: 935
- `_structured_description` updates: 785
- `_emart_product_faq` updates: 891
- Errors after retry: 0

Note: first apply reported 2 errors because `pa_origin=singapore` did not exist. The Singapore term was created and the remaining 2 Sheglam products applied successfully.

## Verification

- Follow-up dry-run: 0 rows, 0 errors
- 17 original `pa_origin` gap products now have canonical `pa_origin`
- Corrected brand origin counts:
  - Bath & Body Works: `malaysia` (18 products)
  - Clean & Clear: `uk` (9 products)
  - Durex: `malaysia` (12 products)
  - Gfors: `south-korea` (3 products)
  - Sheglam: `singapore` (2 products)
  - St. Ives: `uk` (8 products)
  - Vatika Naturals: `india` (2 products)
  - vaseline: `uk` (11 products)

