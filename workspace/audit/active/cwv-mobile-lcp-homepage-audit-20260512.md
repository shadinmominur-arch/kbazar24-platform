# CWV Mobile LCP Homepage Audit - 2026-05-12

## Scope

- URL group: `https://e-mart.com.bd/`
- GSC issue: Mobile LCP longer than 4s, group LCP 4.1s, 115 affected URLs.
- Mode: read-only audit. No code edits, deploys, pushes, Woo/product data changes, or UI redesign.

## Live Checks

- Homepage status: `200`
- Canonical: `https://e-mart.com.bd`
- Robots: `index, follow`
- Cache headers observed:
  - `x-nextjs-cache: HIT`
  - `cache-control: s-maxage=300, stale-while-revalidate`
  - `cf-cache-status: EXPIRED`
- Local lab tooling:
  - `lighthouse`, `@lhci/cli`, `playwright`, and `puppeteer` were not installed.
  - A direct Chromium/CDP LCP probe was attempted but hung and wrote no result file, so this report uses live HTML/header evidence plus source inspection.

## Likely LCP Element

Most likely mobile LCP candidate is the homepage hero text block, especially the visible H1 `AESTURA Atobarrier is here`, with the small hero product image as the next likely candidate.

Evidence:

- The first visible page section is `HeroCarousel`.
- Mobile hero image display box is only `max-w-[118px]` and `h-[136px]`, while the hero text block occupies a larger visible area.
- The hero image itself is already eager/priority-loaded, so a missing hero preload is not the primary issue.

File: `apps/web/src/components/home/HeroCarousel.tsx`

- Hero copy/image data: lines 4-13
- Hero section and H1: lines 18-29
- Hero image container: lines 42-45
- `next/image` config: lines 46-53

## Hero/Banner Image Loading

Hero image:

- Source: `https://e-mart.com.bd/wp-content/uploads/2026/02/image.jpeg`
- `priority` is enabled.
- Live HTML emits a preload with `fetchPriority="high"`.
- Mobile `sizes` is already constrained to `118px`, matching the visible mobile image container.
- This part looks broadly correct and should not be the first change.

## Priority, Fetch Priority, and Lazy Loading

Root cause candidate: below-the-fold product cards are also marked as priority images, which causes live HTML to preload several product images with `fetchPriority="high"` before the user reaches those sections.

Evidence:

- `ProductGridSection` passes `priority={product.id === mobileVisible[0]?.id}` for the first mobile product card in each product rail.
- `ProductGridSection` passes `priority={index < 4}` for desktop grid cards.
- Live homepage HTML includes high-priority preloads for the logo, Meta noscript image, hero image, and multiple product images from product rails.
- The product rails render after `HeroCarousel`, `ShopByCategory`, `OfferCollectionsRail`, and `FlashSaleBanner`, so those product images are not true above-the-fold LCP assets on mobile.

File: `apps/web/src/components/home/HomepageSections.tsx`

- Mobile product-card priority: line 453
- Desktop product-card priority: line 482

File: `apps/web/src/components/product/ProductCard.tsx`

- `priority` prop default and pass-through to `next/image`: lines 16-18 and 95-104

## Heavy Client Components Above Fold

Above the homepage content, the layout includes shared client/runtime surfaces:

- `Providers`
- `Header`
- `CartDrawer`
- `MetaPixel`
- `Toaster`
- `GoogleAnalytics`

The hero itself is a server component, so the main above-fold content does not depend on hero client hydration. Product cards are client components, but their sections are below the first viewport.

Files:

- `apps/web/src/app/layout.tsx`
- `apps/web/src/app/page.tsx`
- `apps/web/src/components/home/HeroCarousel.tsx`
- `apps/web/src/components/home/HomepageSections.tsx`
- `apps/web/src/components/product/ProductCard.tsx`

## Fonts, Scripts, and Render Blocking

Fonts:

- `layout.tsx` loads five Google font families via `next/font/google`: Playfair Display, DM Sans, Hind Siliguri, Jost, and JetBrains Mono.
- Live HTML preloads 12 font files.
- All are configured with `display: 'swap'`, which is good, but the number of preloaded font resources can compete with early image/text rendering on slow mobile.

File: `apps/web/src/app/layout.tsx`

- Font imports: line 12
- Font definitions: lines 18-51

Scripts:

- Meta Pixel uses `strategy="afterInteractive"`, which is not render-blocking in the normal path.
- Google Analytics is injected through `@next/third-parties/google`.
- Live HTML includes a preload for the Meta noscript tracking image and a preload for the Google tag script.

File: `apps/web/src/components/analytics/MetaPixel.tsx`

- Meta script strategy: lines 29-46
- Noscript tracking image: lines 47-55

## Cloudflare and Cache Notes

Headers show a Next cache hit but Cloudflare `cf-cache-status: EXPIRED` for the sampled request. This can still be okay, but the combination means some mobile users may see occasional edge revalidation behavior. It is probably a secondary factor, not the first code fix.

## Root Cause

The strongest actionable root cause is early resource contention: the homepage correctly preloads the hero image, but it also preloads multiple below-the-fold product images as high priority. On mobile, that can delay the true LCP candidate, especially when combined with 12 font preloads and third-party preloads.

## Safest Small Fix Proposal

Recommended first code change:

- Remove `priority` from homepage `ProductGridSection` product cards so below-the-fold product images lazy-load normally.
- Keep hero image `priority` and current hero `sizes` unchanged.
- Do not change UI, sections, tracking logic, product data, or Woo data.

Expected files:

- `apps/web/src/components/home/HomepageSections.tsx`

Checks before deploy:

- `cd apps/web && npm run lint`
- `cd apps/web && npm run build`
- Inspect live homepage HTML after deploy and confirm product image preload tags are gone while the hero preload remains.
- Re-test with Lighthouse/PageSpeed when tooling is available.

## Recommendation

Code change is recommended, but not yet applied. The first fix should be limited to product-card priority hints on the homepage. Do not validate the GSC Core Web Vitals fix until the change is deployed, live HTML confirms reduced preloads, and fresh field data begins to improve.
