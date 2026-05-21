# Emart Development Master — Task Detail

Last updated: 2026-05-21
Coordination model: Claude owns `apps/web` | Codex owns `apps/mobile` + PHP plugins | Shared items listed below.
**Open task priority board** → `workspace/TASKS.md`

⚠️ Conflict rule: Before touching a shared file, check this file for active work by the other agent.

---

## SHARED ZONE — Coordinate before touching

| File/area | Who can touch | Status |
|-----------|--------------|--------|
| `apps/web/src/app/api/mobile/*` | Both (Claude adds endpoints, Codex consumes) | Stable — do not change signatures without notifying both |
| `apps/web/src/app/api/checkout` | Both | Protected — no changes without owner approval |
| `apps/web/src/lib/woocommerce.ts` | Both | Stable API client — add functions, do not remove |
| `apps/web/next.config.js` | Claude only | Do not edit from Codex side |
| WordPress mu-plugins (`/var/www/wordpress/wp-content/mu-plugins/`) | Codex primarily | Claude may read for SEO/API routing only |

---

## WEB FRONTEND — Claude owns (`apps/web`)

### W2: `aria-hidden` focusability on homepage mobile duplicate rails
- **Files:** `apps/web/src/components/home/HomepageSections.tsx`
- **Change:** Add `tabIndex={-1}` to interactive children inside `aria-hidden` duplicate rails, or use `inert` attribute.
- **Effort:** Small

### W3: ProductCard image priority — reduce to true LCP only
- **Files:** `apps/web/src/components/product/ProductCard.tsx`, `apps/web/src/app/shop/page.tsx`, `apps/web/src/app/category/[slug]/page.tsx`
- **Change:** Only first product on first page gets `priority`. Cards 2–4 do not.
- **Effort:** Small

### W4: ReviewsSection — remove unnecessary client refetch
- **Files:** `apps/web/src/components/product/ReviewsSection.tsx:70-93`
- **Change:** Remove `cache: 'no-store'` refetch if server-passed data is sufficient for initial render.
- **Effort:** Small

### W6: Critical CSS inlining (`critters`)
- **Files:** `apps/web/next.config.js`, build pipeline
- **Change:** Add `critters` to extract and inline above-fold CSS. Eliminates render-blocking CSS on mobile.
- **Effort:** High | **Risk:** Medium — smoke test required

### W7: Category OG image fallback
- **Files:** `apps/web/src/app/category/[slug]/page.tsx:94-103`
- **Change:** Fall back to default storefront social image when no category image exists.
- **Effort:** Small

---

## MOBILE APP — Codex owns (`apps/mobile`)

> Read `apps/web/.agent-memory/MEMORY.md` before starting. The mobile BFF (`/api/mobile/*`) is stable — consume it, don't rewrite it.

### M1: Rotate WooCommerce keys — SECURITY HIGH
- **Why:** Prior audit found Woo credentials were directly in mobile app. Keys removed from code but may still be active in Woo admin.
- **Action:** Generate new Woo REST API keys. Update `/api/mobile/*` BFF env only (not mobile app).

### M2: Verify all mobile API calls route through BFF
- **Files:** `apps/mobile/` — search for direct `woocommerce.com` or `e-mart.com.bd/wp-json` calls
- **Action:** Audit; replace any remaining direct calls with `/api/mobile/*` equivalents.

### M3: Mobile cart → checkout flow smoke test
- **Action:** End-to-end: add to cart → checkout → COD. Verify bKash/Nagad payment links still work.

### M4: Push notification integration
- **Action:** Confirm FCM/APNs tokens are being stored and notification triggers are in place.

---

## BACKEND / PHP PLUGINS — Codex primarily

> Always dry-run first. Never mutate checkout/cart/payment/order without explicit owner approval.

### B2: SKU assignment — 0 missing as of 2026-05-15
- **Script:** `workspace/scripts/active/product-sku-audit-dry-run.php`
- **Status:** 0 published products missing SKU, 0 duplicate SKU meta. No action needed unless owner provides new data.

### B3: Product image upload — 16 products
- **File:** `workspace/audit/active/products-need-real-image.csv`
- **Status:** CSV ready. Owner uploads images → Codex assigns in WooCommerce.

### B4: Fresh product SEO / image audit
- **Script:** `workspace/scripts/active/product-seo-audit.php`
- **Last run:** 2026-05-15 — outputs in `workspace/audit/archive/processed/`

---

## UI/UX ARCHITECTURE — Claude owns (`apps/web`)

> Reference: `workspace/audit/archive/layout-ui-ux-audit-20260515/layout-component-ui-ux-setup-audit-20260515.md`
> Rule: Do not redesign — stabilize the component system while preserving visual output.

### U1: Fix missing Tailwind aliases — `bg-card` and `bg-canvas`
- **Why:** 79 usages, not defined in `tailwind.config.js` — silently generates no CSS.
- **Files:** `apps/web/tailwind.config.js`, `apps/web/src/app/globals.css`
- **Effort:** Small | **Risk:** Low

### U2: Update `workspace/docs/theme-contract.md` with canonical token map
- **Change:** One canonical set: `bg`, `card`, `surface`, `ink`, `muted`, `accent`, `border`, `success`, `warning`, `danger`. Mark `lumiere` and `--mb-*` as scoped-island aliases only.
- **Effort:** Small | **Risk:** None (docs only)

### U3: Split `HomepageSections.tsx` into per-section files
- **Files:** `apps/web/src/components/home/HomepageSections.tsx` (1,034 lines)
- **Change:** One file per exported section under `components/home/sections/`. Keep `page.tsx` import order unchanged.
- **Effort:** Medium | **Risk:** Low

### U4: Split `Header.tsx` into focused subcomponents
- **Files:** `apps/web/src/components/layout/Header.tsx` (1,166 lines)
- **Target:** `HeaderShell`, `HeaderLogo`, `HeaderSearch`, `HeaderActions`, `DesktopMegaNav`, `MobileMenuDrawer`, `AnnouncementBar`
- **Effort:** Medium | **Risk:** Medium

### U5: Add shared `ProductGrid` component
- **Files:** Create `apps/web/src/components/collection/ProductGrid.tsx`; adopt in shop + one collection page first.
- **Effort:** Medium | **Risk:** Medium

### U6: Add ARIA tab semantics to `DetailsTabs`
- **Files:** `apps/web/src/components/product/DetailsTabs.tsx`
- **Change:** Add `role="tablist"`, `role="tab"`, `aria-selected`, `aria-controls`, `role="tabpanel"`.
- **Effort:** Small | **Risk:** Low

### U7: Split `CatalogFilters.tsx` mobile/desktop
- **Files:** `apps/web/src/components/product/CatalogFilters.tsx` (569 lines)
- **Target:** `catalog-filter-options.ts`, `useCatalogFilterUrl.ts`, `MobileCatalogFilters.tsx`, `DesktopCatalogFilters.tsx`, `CatalogFilterChip.tsx`
- **Effort:** Medium | **Risk:** Medium

### U8: Add shared layout primitives
- **Files:** Create `apps/web/src/components/ui/PageContainer.tsx`, `SectionShell.tsx`, `NarrowContent.tsx`
- **Effort:** Small | **Risk:** Low

---

## WORKSPACE HYGIENE

### WH1: Fix stale `SEO_TODO.md` references in `CLAUDE.md`
- **Change:** Replace `workspace/SEO_TODO.md` → `workspace/SEO_MASTER.md` in `CLAUDE.md` sections 1, 5, 7.
- **Effort:** Trivial

### WH4: Mark `apps/web/MEMORY.md` as historical
- **Change:** Add top-of-file banner pointing to `.agent-memory/MEMORY.md` and `/root/CLAUDE.md`.
- **Effort:** Trivial

### WH6: Fix output path in `product-image-brand-size-audit.mjs`
- **Files:** `workspace/scripts/active/product-image-brand-size-audit.mjs`
- **Change:** Default `OUT` path → `workspace/audit/active/`
- **Effort:** Trivial

### WH7: Review app-local scripts for archival
- **Files:** `apps/web/scripts/seo-p1-preview.mjs`, `apps/web/scripts/ocr-image-audit.mjs`, `apps/web/scripts/image-logic-fixer.mjs`
- **Change:** If no active owner, move to `workspace/scripts/archive/`. Keep `check-all.sh`, `audit-duplicate-products.mjs` (referenced in package.json).
- **Effort:** Small

---

## DO NOT TOUCH (protected)

- Checkout / cart / payment / order logic
- `_sku`, `_price`, `_stock_quantity` WooCommerce meta
- `apps/web/src/app/api/checkout`
- Customer data / order history

---

## Active Branch Convention

- Claude: `claude/<feature>-<ticket>`
- Codex: `codex/<feature>-<ticket>`
- Merge to `main` only after smoke test passes on VPS
