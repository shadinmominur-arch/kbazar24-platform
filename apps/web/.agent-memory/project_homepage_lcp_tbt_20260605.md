# Homepage LCP/TBT Perf Pass - 2026-06-05

Codex deployed `d8fb0ac perf(home): defer below-fold homepage sections`.

What changed:
- Split `OfferCollectionsRail` out of `HomepageSections` so the static above-fold/near-fold offer rail does not pull the full homepage section module into `/`.
- Added `HomepageDeferredSections` with `next/dynamic({ ssr: false })` plus near-viewport/idle activation for Flash Sale, product rails, concern/ingredient/routine sections, authenticity/brand/customer/blog/trust sections.
- Kept `HeroCarousel`, `MobileDiscovery`, `ShopByCategory`, and `OfferCollectionsRail` static.
- Verified GA4, Meta Pixel, and Google rating badge already defer through `lazyOnload` plus idle/load gates.

Measured results:
- Homepage First Load JS: `157 kB` -> `108 kB`.
- Lighthouse mobile fresh pre-patch: score `63`, LCP `4.0s`, TBT `1,000ms`, total bytes `1,321 KiB`.
- Lighthouse mobile post-deploy: score `97`, LCP `2.1s`, TBT `120ms`, total bytes `592 KiB`.
- LCP element remains `Shop by category` H2, but element render delay improved from about `1179ms` to `267ms`.

Reports:
- Pre-patch: `workspace/audit/active/lighthouse-home-mobile-20260605-fresh.report.report.json`
- Post-patch: `workspace/audit/active/lighthouse-home-mobile-20260605-post-defer.report.report.json`

Follow-up on 2026-06-06:
- An SEO-balancing experiment added a visible SSR `Popular skincare paths` / `Explore Emart` homepage link hub, then owner rejected it as a freeze-time design/layout change.
- Removed the visible link hub in `2e8b45b revert(home): remove visible SEO link hub`; deleted `HomepageSeoLinkHub.tsx` and removed it from `apps/web/src/app/page.tsx`.
- Do not re-add a visible homepage SEO/link block during the 2026-05-22 -> 2026-07-03 freeze without explicit owner approval.
- Last captured Lighthouse before the removal commit was `workspace/audit/active/lighthouse-home-mobile-20260606-linkhub-analytics-30s.report.report.json`: score `85`, FCP `1.5s`, LCP `2.2s`, TBT `510ms`, Speed Index `1.5s`, CLS `0.014`, TTI `9.1s`, server response `20ms`.
- No post-removal Lighthouse was captured yet; live smoke after removal returned homepage `200` and `/api/mobile/products?per_page=1` `200`.
