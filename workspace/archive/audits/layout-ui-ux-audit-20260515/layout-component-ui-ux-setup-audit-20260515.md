# Emart Layout + Component Setup Audit For Future UI/UX Development

Date: 2026-05-15  
Repo: `/root/emart-platform`  
Scope: `apps/web` layout, route templates, component organization, design tokens, UI/UX development readiness  
Mode: audit/report only. No UI redesign, no production logic edit, no deploy, no PM2 restart.

## Executive Summary

Overall status: the storefront is usable and the core commerce UI is not in a broken architectural state. The App Router structure is clear, public routes mostly render server-side, `ProductCard` is the de facto catalog primitive, and there is already a theme contract.

Biggest future-development blockers:

- Design tokens are split across several systems and some Tailwind classes used in UI files are not defined in `tailwind.config.js`.
- Large client components (`Header.tsx`, `HomepageSections.tsx`, `CatalogFilters.tsx`, `ProductInfo.tsx`) carry too many responsibilities.
- Shared primitives exist (`Button`, `Badge`, `TrustStrip`, `WpImage`) but are inconsistently adopted.
- Homepage, categories, catalog, PDP, and private/account pages use different layout idioms, so future UI work can easily create visual drift.

What is already good:

- `workspace/docs/theme-contract.md` exists and gives real UI rules.
- `ProductCard` is centralized and stable enough to remain the canonical product card.
- Collection pages already have `CollectionPageHeader`.
- Product, category, shop, brand, concern, ingredient, routine, and blog pages are separated by route.
- Homepage heavy sections are dynamically imported from `page.tsx`, which helps isolate future work.

Important coordination note:

- Claude was active during inspection, and `DetailsTabs.tsx` changed while work was in progress. Latest `git status` only shows the two new audit reports as untracked. Still treat recent UI files as fresh Claude work and avoid editing them without a new implementation task.

## Current Layout Map

### Global Shell

Files:

- `apps/web/src/app/layout.tsx`
- `apps/web/src/components/layout/Header.tsx`
- `apps/web/src/components/layout/Footer.tsx`
- `apps/web/src/components/cart/CartDrawer.tsx`
- `apps/web/src/app/providers.tsx`

Role:

```text
RootLayout
  -> Providers
  -> Skip link
  -> Header
  -> main#main-content
  -> Footer
  -> CartDrawer
  -> MetaPixel / GoogleAnalytics
```

Assessment:

- The shell is logically correct.
- The `Header` is too large and too client-heavy for future iteration.
- `CartDrawer` is appropriately global but should remain isolated from checkout/order logic.

### Homepage Layout

Files:

- `apps/web/src/app/page.tsx`
- `apps/web/src/components/home/HeroCarousel.tsx`
- `apps/web/src/components/home/MobileDiscovery.tsx`
- `apps/web/src/components/home/ShopByCategory.tsx`
- `apps/web/src/components/home/HomepageSections.tsx`
- `apps/web/src/components/common/TrustStrip.tsx`

Current flow:

```text
HeroCarousel
MobileDiscovery
ShopByCategory
OfferCollectionsRail
FlashSaleBanner
Best sellers ProductGridSection
New arrivals ProductGridSection
ConcernTilesSection
IngredientTilesSection
RoutineTeaserSection
AuthenticityStorySection
BrandLogoGridSection
CustomerVoiceSection
SkinQuizCTA
OriginStoryBlock
BlogTeaserSection
TrustStrip
```

Assessment:

- The flow is clear in `page.tsx`.
- `HomepageSections.tsx` is a bundled section library, not a single focused component.
- Future homepage work should split sections by ownership without changing layout.

### Catalog / Collection Layout

Files:

- `apps/web/src/app/shop/page.tsx`
- `apps/web/src/app/category/[slug]/page.tsx`
- `apps/web/src/app/brands/[slug]/page.tsx`
- `apps/web/src/app/concerns/[slug]/page.tsx`
- `apps/web/src/app/ingredients/[slug]/page.tsx`
- `apps/web/src/app/routine/[step]/page.tsx`
- `apps/web/src/components/collection/CollectionPageHeader.tsx`
- `apps/web/src/components/product/CatalogFilters.tsx`
- `apps/web/src/components/product/ProductCard.tsx`

Common pattern:

```text
Collection header
Mobile filter bar
Desktop sidebar filters
Product grid
Pagination
Optional guide/details content
```

Assessment:

- This should become a shared `CollectionShell` / `ProductGrid` pattern later.
- Shop and category duplicate grid/filter/pagination logic.
- `ProductCard` usage is strong, but priority handling and grid layout should be centralized later.

### Product Detail Layout

Files:

- `apps/web/src/app/shop/[slug]/page.tsx`
- `apps/web/src/components/product/ProductImage.tsx`
- `apps/web/src/components/product/ProductInfo.tsx`
- `apps/web/src/components/product/DetailsTabs.tsx`
- `apps/web/src/components/product/ReviewsSection.tsx`
- `apps/web/src/components/product/RelatedProducts.tsx`
- `apps/web/src/components/product/StickyATC.tsx`

Current structure:

```text
Breadcrumbs
ProductImage + ProductInfo
DetailsTabs
ReviewsSection
ProductFaqSection
Related Products
```

Assessment:

- PDP layout is sane and should not be rebuilt.
- `ProductInfo.tsx` mixes display, helper functions, product fact extraction, WhatsApp URL logic, origin/category display, and cart actions.
- `DetailsTabs.tsx` has recently been modified by Claude to render all panels in HTML. Preserve that intent.

### Categories Hub Theme Island

Files:

- `apps/web/src/app/categories/page.tsx`
- `apps/web/src/components/categories/*`
- `apps/web/src/styles/midnight-blossom.css`

Assessment:

- This is a separate themed experience using `data-theme="midnight-blossom"` and `--mb-*` variables.
- It can remain as an intentional themed island, but future components should not copy `--mb-*` patterns into normal commerce pages.

### Private / Utility Routes

Files:

- `apps/web/src/app/account/*`
- `apps/web/src/app/checkout/*`
- `apps/web/src/app/order-success/*`
- `apps/web/src/app/track-order/*`
- `apps/web/src/app/wishlist/*`

Assessment:

- These pages use older gray/primary utility styling in places.
- They are protected flows. Do not polish them as part of general UI cleanup unless the owner explicitly approves that exact route.

## Component Inventory

Observed component directories:

| Directory | Count | Role |
|---|---:|---|
| `components/home` | 19 | Homepage and discovery sections |
| `components/product` | 18 | Product card, PDP, filters, reviews, related products |
| `components/categories` | 10 | Categories hub themed island |
| `components/layout` | 5 | Header, footer, navigation, payment/signup |
| `components/shared` | 3 | Button, Badge, StockBar |
| `components/common` | 2 | Breadcrumbs, TrustStrip |
| `components/analytics` | 2 | Meta pixel/event components |
| `components/ui` | 1 | WpImage |
| Other single directories | 1 each | Collection, social, seo, category, cart, navigation |

Observed TSX counts:

- `apps/web/src/components`: 66 TSX files.
- `apps/web/src/app`: 57 TSX files.
- Files with `"use client"` under app/components: 58.

Large files to split later:

| File | Lines | Issue |
|---|---:|---|
| `apps/web/src/components/layout/Header.tsx` | 1166 | Search, account, mega menu, mobile drawer, nav, logo, announcements all in one client component |
| `apps/web/src/components/home/HomepageSections.tsx` | 1034 | Many unrelated homepage sections in one module |
| `apps/web/src/components/product/CatalogFilters.tsx` | 569 | Mobile drawer, desktop sidebar, URL state, option config all together |
| `apps/web/src/components/product/ProductInfo.tsx` | 521 | Product fact helpers, display, CTAs, WhatsApp, stock/SKU/origin/category logic together |
| `apps/web/src/app/shop/[slug]/page.tsx` | 680 | PDP route includes schema, data fetching, HTML parsing, and layout orchestration |

## Findings

### 1. Tailwind Token Mismatch: `bg-card` And `bg-canvas` Are Used But Not Defined

- Severity: High
- Area: design tokens / UI consistency
- Evidence:
  - `bg-card` / `bg-canvas` appear 79 times.
  - Examples: `MobileDiscovery.tsx`, `CatalogFilters.tsx`, `CheckoutClient.tsx`, `ProductInfo.tsx`, policy/static pages.
  - `globals.css` defines CSS variables such as `--color-card`, but `tailwind.config.js` does not define `card` or `canvas` colors.
- Why it matters:
  - Unknown Tailwind classes silently generate no CSS. Some UI surfaces may depend on inherited background instead of intended card/canvas colors.
  - Future developers will assume these utilities work.
- Safe future fix:
  - Add Tailwind color mappings for `card` and `canvas` to the existing token values, or replace those classes with existing configured utilities such as `bg-white`, `bg-bg`, or `bg-bg-alt`.
  - Do this as a token-only pass with screenshots before/after.
- Risk level: Low if token aliases match existing CSS variables.

### 2. Multiple Token Systems Are Coexisting

- Severity: High
- Area: design system
- Evidence:
  - `workspace/docs/theme-contract.md` defines brand tokens.
  - `src/styles/tokens.css` defines `--color-brand-*`.
  - `src/app/globals.css` defines `--color-bg`, `--color-card`, `--color-accent`, type utilities, button utilities, badges.
  - `tailwind.config.js` defines `bg`, `ink`, `muted`, `accent`, `primary`, `lumiere`, and compatibility aliases.
  - `midnight-blossom.css` defines `--mb-*` theme variables.
- Why it matters:
  - New UI work can choose the wrong token family and create drift.
  - Contrast/accessibility fixes become harder because the same visual role has several names.
- Safe future fix:
  - Declare one canonical token map: `bg`, `card`, `surface`, `ink`, `muted`, `accent`, `border/hairline`, `success`, `warning`, `danger`.
  - Keep `lumiere` and `--mb-*` as compatibility/themed-island aliases until migrated.
- Risk level: Medium because broad token changes can alter many pages.

### 3. Header Is A Monolith

- Severity: High
- Area: component setup / performance / future UX
- File: `apps/web/src/components/layout/Header.tsx`
- Evidence:
  - 1166 lines.
  - Client component.
  - Contains search suggestions, account dropdown, mega menu class logic, desktop nav, mobile drawer, counts, logo, announcement strip, drawer expansion logic.
- Why it matters:
  - Every small header change risks search/nav/mobile regressions.
  - It increases client bundle surface for global layout.
- Safe future fix:
  - Split without visual change:
    - `HeaderShell.tsx`
    - `HeaderLogo.tsx`
    - `HeaderSearch.tsx`
    - `HeaderActions.tsx`
    - `DesktopMegaNav.tsx`
    - `MobileMenuDrawer.tsx`
    - `AnnouncementBar.tsx`
  - Keep state only in the smallest client subcomponents.
- Risk level: Medium.

### 4. HomepageSections Is A Section Dump

- Severity: Medium
- Area: homepage maintainability
- File: `apps/web/src/components/home/HomepageSections.tsx`
- Evidence:
  - 1034 lines.
  - Exports many unrelated sections: offers, concerns, ingredients, routine teaser, authenticity story, product grid, brand grid, reviews, quiz, origin story, blog, shipping/payment/returns, WhatsApp blocks.
- Why it matters:
  - Homepage work becomes hard to review.
  - A change to one section forces parsing a large mixed file.
- Safe future fix:
  - Split exported sections into individual files under `components/home/sections/`.
  - Keep `page.tsx` order exactly the same.
  - Keep existing dynamic imports where they help performance.
- Risk level: Low if done as move-only plus import updates.

### 5. Shared UI Primitives Exist But Are Not Canonical In Practice

- Severity: Medium
- Area: component setup
- Files:
  - `components/shared/Button.tsx`
  - `components/shared/Badge.tsx`
  - `globals.css` `.btn-*`, `.badge-*`
  - many inline Tailwind buttons/badges
- Evidence:
  - `Button` and `Badge` have almost no imports in app/components.
  - ProductCard uses global `.badge-sale`, `.badge-new`, `.badge-auth` classes and inline button styles.
  - Static/private pages use inline button styles or `.btn-primary`.
- Why it matters:
  - Future UI changes will duplicate button/badge variants instead of improving one primitive.
- Safe future fix:
  - Build or bless canonical primitives before future UI work:
    - `Button`
    - `IconButton`
    - `Badge`
    - `Chip`
    - `Card`
    - `Input`
    - `Select`
    - `Container`
    - `SectionShell`
  - Adopt first in new code, then migrate old code gradually.
- Risk level: Low if appearance remains identical.

### 6. Product Grid Logic Is Duplicated Across Collection Routes

- Severity: Medium
- Area: layout consistency / performance
- Files:
  - `apps/web/src/app/shop/page.tsx`
  - `apps/web/src/app/category/[slug]/page.tsx`
  - `apps/web/src/app/new-arrivals/page.tsx`
  - `apps/web/src/app/sale/page.tsx`
  - `apps/web/src/app/concerns/[slug]/page.tsx`
  - `apps/web/src/app/ingredients/[slug]/page.tsx`
- Evidence:
  - Shop and category duplicate filter/sidebar/grid/pagination structure.
  - Shop grid starts `grid-cols-1` then switches to 2 columns at 430px; category starts `grid-cols-2`.
  - Several routes pass ProductCard priority independently.
- Why it matters:
  - Catalog changes will drift page by page.
  - Image priority/LCP fixes have to be repeated.
- Safe future fix:
  - Add a shared `ProductGrid` component that owns:
    - responsive columns
    - `ProductCard` priority policy
    - empty state
    - pagination UI hook points
  - Add `CollectionLayout` or `CollectionShell` for header/sidebar/mobile filters.
- Risk level: Medium because catalog pages affect revenue and SEO.

### 7. CatalogFilters Combines Mobile And Desktop Behavior In One Client File

- Severity: Medium
- Area: component maintainability
- File: `apps/web/src/components/product/CatalogFilters.tsx`
- Evidence:
  - 569 lines.
  - Contains desktop sidebar and mobile sheet/drawer behavior.
  - Owns filter option config, URL param mutation, active count, mobile chip bar, drawer state.
- Why it matters:
  - It is hard to safely add one filter without touching both mobile and desktop behavior.
- Safe future fix:
  - Split into:
    - `catalog-filter-options.ts`
    - `useCatalogFilterUrl.ts`
    - `MobileCatalogFilters.tsx`
    - `DesktopCatalogFilters.tsx`
    - `CatalogFilterChip.tsx`
- Risk level: Medium.

### 8. `use client` Surface Is Broad

- Severity: Medium
- Area: performance / component boundaries
- Evidence:
  - 58 files under app/components include `"use client"`.
  - Many are rightly client-side, but some display-heavy sections are client by default because they include small interaction or state.
- Why it matters:
  - Future UI work may accidentally push static layout into the client bundle.
- Safe future fix:
  - For every new component, default to server component.
  - Keep client components small: search boxes, drawers, accordions, tabs, add-to-cart buttons, forms.
  - Split static shell from interactive controls.
- Risk level: Low if done gradually.

### 9. Duplicate TrustStrip Components

- Severity: Medium
- Area: component consistency
- Files:
  - `apps/web/src/components/common/TrustStrip.tsx`
  - `apps/web/src/components/categories/TrustStrip.tsx`
- Evidence:
  - Homepage uses common TrustStrip.
  - Categories page uses categories TrustStrip with `--mb-*` theme.
- Why it matters:
  - Trust content and visual treatment can drift.
- Safe future fix:
  - Keep one canonical `TrustStrip` with a `theme="default" | "midnight-blossom"` prop, or keep the categories version but document it as a themed island exception.
- Risk level: Low.

### 10. Categories Hub Uses A Separate Theme Island

- Severity: Medium
- Area: visual system
- Files:
  - `apps/web/src/app/categories/page.tsx`
  - `apps/web/src/styles/midnight-blossom.css`
  - `apps/web/src/components/categories/*`
- Evidence:
  - `categories/page.tsx` renders `<main data-theme="midnight-blossom" className="mb-shell ...">`.
  - Components use `mb-container`, `mb-card`, `--mb-pink`, `--mb-navy`, etc.
- Why it matters:
  - It is fine if intentional, but dangerous if copied into normal catalog/PDP work.
- Safe future fix:
  - Document categories hub as a special campaign/live-commerce island.
  - Do not use `--mb-*` in ProductCard, PDP, checkout, or normal collection pages.
- Risk level: Low.

### 11. DetailsTabs Needs A Future Accessibility Pass

- Severity: Medium
- Area: PDP UX / accessibility / SEO
- File: `apps/web/src/components/product/DetailsTabs.tsx`
- Evidence:
  - It is a client component.
  - It now renders all panels in HTML and hides inactive ones with CSS, which is good for SEO/LLM readability.
  - It does not currently expose full tab semantics such as `role="tablist"`, `role="tab"`, `aria-selected`, `aria-controls`, and associated `tabpanel`.
- Why it matters:
  - Current SEO direction is good, but tab UX should become more accessible before future PDP polish.
- Safe future fix:
  - Preserve all-panel HTML rendering.
  - Add tab ARIA semantics and keyboard behavior.
  - Do not revert to conditional content rendering.
- Risk level: Low.

### 12. Private / Utility Pages Are Styling Outliers

- Severity: Low to Medium
- Area: UI consistency
- Files:
  - `AccountClient.tsx`
  - `OrdersClient.tsx`
  - `CheckoutClient.tsx`
  - `TrackOrderClient.tsx`
  - `WishlistClient.tsx`
- Evidence:
  - These pages use older `gray-*`, `primary-*`, rounded-lg, and form styles.
  - Checkout also contains emoji section headings.
- Why it matters:
  - They look and behave differently from catalog/PDP surfaces.
  - But they are protected flows, so broad polish is risky.
- Safe future fix:
  - Only after explicit approval, introduce a `UtilityPageShell` and shared form controls.
  - Do route-by-route visual regression testing and checkout smoke tests.
- Risk level: High for checkout; medium for account/wishlist/track-order.

### 13. Image Abstraction Is Incomplete

- Severity: Medium
- Area: image consistency / performance
- Files:
  - `components/ui/WpImage.tsx`
  - many direct `next/image` usages
- Evidence:
  - `WpImage` exists and handles relative WordPress image paths/fallback.
  - Most product/home/layout files use direct `Image`.
- Why it matters:
  - Fallbacks, sizes, alt policy, and WordPress path normalization are inconsistent.
- Safe future fix:
  - Keep direct `next/image` where local assets are simple.
  - Use `WpImage` or a future `CommerceImage` for product/category/brand media.
  - Document when to use each.
- Risk level: Low to medium.

### 14. Section Containers Are Inconsistent

- Severity: Medium
- Area: layout system
- Evidence:
  - `max-w-7xl px-4`
  - `max-w-[1280px] px-6`
  - `mb-container`
  - `max-w-6xl`
  - section-specific padding and widths
- Why it matters:
  - Future pages will feel slightly off even if individual components are fine.
- Safe future fix:
  - Add shared layout primitives:
    - `PageContainer`
    - `SectionShell`
    - `NarrowContent`
    - `CollectionShell`
    - `RailViewport`
- Risk level: Low.

### 15. ProductCard Is Good Enough To Be Canonical, But Needs Guardrails

- Severity: Medium
- Area: commerce component
- File: `apps/web/src/components/product/ProductCard.tsx`
- Evidence:
  - Centralized product card with variants, image ratio, price formatting, cart toast, badges, stock state, rating display.
  - It handles wishlist UI but the visible wishlist button has no current action in this file.
  - It owns image fallback state.
- Why it matters:
  - ProductCard is the single most important reusable UI component.
- Safe future fix:
  - Keep it canonical.
  - Move variant chip extraction to a helper if it grows.
  - Add a no-op/disabled/real wishlist decision later; do not leave focusable controls with unclear behavior.
  - Centralize priority policy outside the card.
- Risk level: Medium because product cards are everywhere.

## Passed / Keep

- Keep App Router route separation. It is clear enough.
- Keep `ProductCard` as canonical product card.
- Keep `CollectionPageHeader`; expand it rather than duplicating headers.
- Keep `workspace/docs/theme-contract.md`; update it instead of replacing it.
- Keep `midnight-blossom` only as a scoped categories hub theme unless a full design decision changes that.
- Keep homepage visual order stable unless the user explicitly asks for a homepage redesign.
- Keep checkout/cart/payment/order pages protected from general UI cleanup.
- Keep `DetailsTabs` all-panel HTML behavior for SEO/LLM readability.

## Future Component Architecture Plan

### Layer 1: Tokens And Primitives

Target future files:

- `apps/web/src/components/ui/Button.tsx`
- `apps/web/src/components/ui/IconButton.tsx`
- `apps/web/src/components/ui/Badge.tsx`
- `apps/web/src/components/ui/Chip.tsx`
- `apps/web/src/components/ui/Card.tsx`
- `apps/web/src/components/ui/Input.tsx`
- `apps/web/src/components/ui/Select.tsx`
- `apps/web/src/components/ui/Tabs.tsx`
- `apps/web/src/components/ui/Drawer.tsx`
- `apps/web/src/components/ui/PageContainer.tsx`
- `apps/web/src/components/ui/SectionShell.tsx`
- `apps/web/src/components/ui/CommerceImage.tsx`

Rule:

- New UI should use primitives.
- Old UI should migrate only when a route is already being touched for an approved reason.

### Layer 2: Commerce Layouts

Target future files:

- `apps/web/src/components/layout/StorefrontShell.tsx`
- `apps/web/src/components/collection/CollectionShell.tsx`
- `apps/web/src/components/collection/ProductGrid.tsx`
- `apps/web/src/components/collection/Pagination.tsx`
- `apps/web/src/components/product/PdpShell.tsx`
- `apps/web/src/components/product/ProductFacts.tsx`
- `apps/web/src/components/product/ProductActions.tsx`

Rule:

- Shop/category/brand/concern/ingredient/routine routes should share the same grid and pagination primitives.
- PDP should keep server-rendered facts/content and isolate only interactive controls as clients.

### Layer 3: Large Component Splits

Split without visual changes:

- `Header.tsx` into search, mega nav, actions, drawer, logo, announcement modules.
- `HomepageSections.tsx` into one file per section.
- `CatalogFilters.tsx` into mobile/desktop/filter-url modules.
- `ProductInfo.tsx` helper functions into `lib/product-display` or small product subcomponents.

### Layer 4: Route-Specific Shells

Recommended shells:

- `HomePageShell` - homepage section ordering only.
- `CollectionPageShell` - catalog/filter/grid pages.
- `PdpPageShell` - PDP structure.
- `StaticPageShell` - policies/about/contact/story pages.
- `UtilityPageShell` - account/wishlist/track-order/order-success.
- `CheckoutShell` - only if checkout work is explicitly approved.

## Recommended Future Work Order

1. Freeze current UI behavior and document that this audit is architectural, not a redesign.
2. Add missing Tailwind aliases for `card` and `canvas`, or replace the invalid classes. Screenshot before/after.
3. Update `workspace/docs/theme-contract.md` with the canonical token names and themed-island exception.
4. Create a UI/component contract doc: which primitives to use, where new components live, and what not to touch.
5. Split `HomepageSections.tsx` by section without changing markup.
6. Split `Header.tsx` into focused subcomponents without changing layout.
7. Introduce `ProductGrid` and use it on one low-risk collection page first.
8. Split `CatalogFilters` mobile/desktop behavior after ProductGrid is stable.
9. Add accessible `Tabs` primitive and apply it to `DetailsTabs` while preserving raw HTML content.
10. Only after explicit approval, normalize private/utility pages route by route.

## Files To Edit Later

Do not edit these now while Claude is active. For a future implementation task:

- `apps/web/tailwind.config.js`
- `apps/web/src/app/globals.css`
- `workspace/docs/theme-contract.md`
- `apps/web/src/components/layout/Header.tsx`
- `apps/web/src/components/home/HomepageSections.tsx`
- `apps/web/src/components/product/CatalogFilters.tsx`
- `apps/web/src/components/product/ProductInfo.tsx`
- `apps/web/src/components/product/ProductCard.tsx`
- `apps/web/src/components/product/DetailsTabs.tsx`
- `apps/web/src/app/shop/page.tsx`
- `apps/web/src/app/category/[slug]/page.tsx`
- `apps/web/src/app/brands/[slug]/page.tsx`
- `apps/web/src/app/concerns/[slug]/page.tsx`
- `apps/web/src/app/ingredients/[slug]/page.tsx`

## Final Recommendation

Do not redesign the UI first. First stabilize the component system: fix missing token aliases, document the token hierarchy, split oversized files, and introduce layout primitives that preserve the current look. Once that foundation is stable, future UI/UX improvements can happen page by page without breaking SEO, performance, checkout, or product data trust.
