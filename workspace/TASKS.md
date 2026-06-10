# Emart Task Board
Last updated: 2026-06-09 (meta gap audit: 781 products have weak rank_math-only meta desc)
Freeze: 2026-05-22 → 2026-07-03 (structural/nav only — content, SEO, automation OK)
**[C]** Claude · **[X]** Codex · **[O]** Owner · **[A]** Auto/OpenClaw

---

## 🤖 RUNNING AUTONOMOUSLY

| Job | Status | Notes |
|---|---|---|
| `emart-meta-gen` (PM2) | ✅ stopped — job complete | 41/42 bad metas fixed Jun 9; 6 "original original" need Woo taxonomy fix (pa_brand/pa_origin term "original") |
| meta_generator dry-run (PID 448966, manual) | 🔄 running | Item #14 — 1266-product dry-run, see #14 below |
| `emart-presence` (PM2) | ✅ running | WebSocket, 33d uptime |
| `emart-checkout-monitor` (PM2 cron) | ✅ all 8 steps pass | Every 15 min. Fixed 2026-06-10: Step 7b test SKU was hardcoded to product 93315 (Kerasys shampoo), which went out of stock and caused 5x false-alarm 409 alerts; switched test SKU to product 2591 (COSRX Snail Mucin essence, in stock) |
| Python crons | ✅ running | site_health, daily_report, low_stock |
| GMC sync | ✅ last run Jun 5 | 3,523/3,630 approved |

---

## 🔴 OWNER — Do these (workspace/docs/OWNER-ACTIONS-20260605.md)

1. **MailPoet review email** — WooCommerce trigger → Order Completed → 3-day delay → review email
2. **Meta CAPI test** — COD test order → Events Manager: verify Purchase value > 0 + BDT + InitiateCheckout
3. **GSC URL indexing** — 7 URLs listed in OWNER-ACTIONS doc
4. **Cloudflare cache rule** — /shop + /category, 1hr edge TTL
5. **GMC title-risk products** — 11 products in gmc-steps3-6-report-20260605.md, approve/reject title changes
6. **GMC data/asset** — 2 products missing price/image: IDs 63749, 62576
7. **GMC mixed manual** — 6 products: IDs 36262, 3274, 56108, 3753, 38292, 26194
8. **16 product images** — workspace/audit/active/products-need-real-image.csv
9. **pa_concern 1,161 rows** — 13 conservative assignments applied Jun 6 and `tag:products` revalidated; remaining 1,147 left blank due no reliable signal
10. ~~**OpenClaw meta generator**~~ — ✅ resolved Jun 9: process stopped, job complete, 41/42 bad metas fixed
11. **6 "original original" metas** — find `pa_brand`/`pa_origin` Woo taxonomy terms with value "original" and correct them; regenerate those 6 metas after fix
14. **1304-product meta regen (781 missing + 523 bad "original" pattern) — IN PROGRESS** — `meta_generator.py` updated with `--force`/`--ids-file`. Dry-run resumed in background (PID 448966 as of 2026-06-10 01:22 UTC) for the 1266 remaining IDs in `workspace/docs/meta_regen_ids_remaining_20260610.txt`, output → `workspace/audit/active/meta-generator-2026-06-10-resume.log`. First 38 results already done in `workspace/audit/active/meta-generator-2026-06-10-003216.jsonl`. **This is a dry-run only — no DB writes yet.** Next: let it finish, spot-review JSONL output, then re-run WITHOUT `--dry-run` to apply, then revalidate `tag:products` via /api/revalidate.
12. ~~**Product duplicate review**~~ — ✅ resolved Jun 9: redirects deployed first, 12 retire products set to `draft`; manually purge the 12 old URLs listed in `workspace/audit/active/duplicate-resolution-recommendations-20260609.md` if Cloudflare still serves stale old PDP HTML
13. **Image/duplicate follow-up** — final browser-ranked list ready at `workspace/audit/active/combined-image-duplicate-browser-final-20260609.md`; 33 Level A likely image/action items need source-image approval before changes

---

## 🟢 CLAUDE — Next tasks (2026-06-10)

### C1 — Blog generator: rewritten, tested, READY TO RUN (not scheduled)
- `/root/.openclaw/workspace-emart/blog_generator.py` fully rewritten: GSC-informed + evergreen topic bank, 5 rotating writer personas, anti-AI-detection prompt rules (no separate humanizer pass), in-content internal auto-linking (`/ingredients/*`, `/concerns/*`, `/category/*`), always-attach featured product image, OpenRouter model list fixed to working free models.
- ✅ Live test passed: published post 93922 "Innisfree Skincare Guide for Bangladesh" (https://e-mart.com.bd/blog/innisfree-skincare-guide-for-bangladesh-volcanic-clay-mask-face-wash-sunscreen) via `openai/gpt-oss-120b:free` fallback. State file updated (`gsc_used_indices: [0]`, `persona_index: 1`).
- **Per owner instruction "meta first, blog next" — do NOT run again or add cron until item #14 (meta regen) has progressed/completed** (shared OpenRouter free-tier quota). Suggested cron once cleared: `0 2,10,18 * * *` (3x/day).

### C2 — Schema/social sameAs — ✅ DONE 2026-06-10
- Added `COMPANY.social.tiktok` to Organization `sameAs` in `layout.tsx`. Built on Local + VPS, `pm2 restart emartweb` done, live smoke HTTP 200, live JSON-LD confirmed includes `https://www.tiktok.com/@emart_bdofficial`. Committed `806938f`, pushed to `origin/main`, VPS git aligned to `806938f`.
- Reddit/LinkedIn `sameAs`: still blocked — no profile URLs exist in `companyProfile.ts`; need owner to provide real URLs before adding (cannot fabricate URLs).

### C3 — Strategic SEO note (owed, not yet written up)
- Owner asked for a synthesis on: Android default search engine (Google) dominance in Bangladesh + mobile-first SEO implications, how AI/LLM search surfaces (AI Overviews, ChatGPT/Perplexity/Gemini) consume schema/FAQ content for citations, and factoring TikTok/Facebook/YouTube trending topics into blog topic selection. Not yet delivered — schema audit groundwork done (homepage/category schema confirmed mostly correct).

### C4 — GEO/AEO standing consideration (added 2026-06-10)
- Owner: keep Generative Engine Optimization (AI Overviews/ChatGPT/Perplexity/Gemini citations) and Answer Engine Optimization (featured snippets/PAA/voice, FAQPage schema) in mind for ALL future SEO/content work, not a one-off task. Documented in `workspace/SEO_MASTER.md` under "STANDING CONSIDERATION — GEO & AEO". New content types (blog, future `/best/*`, `/compare/*`) should ship with `Article`/`FAQPage`/`HowTo` schema from the start.

### C5 — 14-item SEO/frontend audit — Phase 1-4 done for approved batch 2026-06-10
- Verified all 14 items (A1, B2-B6, C7-C11, D12-D14) with file:line references. Several were already resolved/stale: A1 (Pixel ID `763041131179021` confirmed correct, env var present), B2 (dead `ShopByCategorySection` — removed as cleanup), C10 meta-description part (contact page already has one), D12 (blog Article JSON-LD + byline already implemented).
- **Fixed & deployed** (commits `d82b421`, `b8eba66`, `508beef`, `c08de32`, pushed to `origin/main`): B6 twitter:site `@emartbd`→`@emartskincarebd`; C11 robots.txt CCBot disallow→allow; B2 dead-code removal; C9 sitemap lastmod split (catalog-reflecting pages get fresh generation-time date, static policy pages omit lastmod instead of frozen `2026-05-16`). Built, `pm2 restart emartweb`, live smoke verified (note: edge cache served stale `@emartbd` briefly — origin confirmed correct).
- **Deferred**: B3 (Moisturizers card → `/category/night-cream`, slugCandidates typo `cream-moisturizers`→`cream-moisturizer`) — owner does NOT want a slug/URL change; instead wants more products assigned into whichever category backs "Moisturizers" so the displayed `product_count` is more representative. This is a WooCommerce category-assignment **data task**, not a code fix — needs a follow-up session to identify which moisturizer products should be added to `night-cream` (currently 15) or `cream-moisturizer` (21).
- **Not yet actioned (need GO)**: B5 (hero subcopy duplicate-text `data-nosnippet`), C7 (product `og:type` conflict — two tags emitted), C8 (JSON-LD `dateModified`/`datePublished` off by Dhaka UTC+6 offset), C10 remainder (marquee + cart-preview `data-nosnippet`), D13 (ingredient/concern internal links on PDP), D14 (numbered pagination on /shop, /category). B4 (hero raw `<img>`→`next/image`) explicitly deferred as separate LCP-sensitive task.

---

## 🟡 CODEX — Next tasks

### X2 — Impression-priority humanizer
- ✅ First 10 non-holdout impression-priority products applied Jun 5
- ✅ Jun 6 follow-up: current reviewed JSONL exhausted; 10/10 eligible rows applied, `58506` markdown fence cleanup applied, product cache revalidated
- Reviewed JSONL: workspace/humanizer/impression-priority/active/impression-priority-2026-06-05.jsonl
- Holdout preserved: 2611, 2591, 4064
- Next: monitor GSC movement; generate/review a new impression-priority JSONL before applying more products

### X3 — Mobile M0
- ✅ Local release-readiness pass: BFF credential audit clean, stale Woo `.env.example` removed, shipping policy aligned, checkout success response fixed
- ✅ Validation: `npm ls --depth=0`, `npx expo config --type public`, `npx expo export --platform android`, `npx expo-doctor` 18/18
- ✅ Logic pass: product-detail missing-param hook guard fixed, Card copy removed until SSLCommerz exists, mobile JWT review auth wired through live `/api/product-reviews`
- ⚠️ Live BFF gap: `/api/mobile/cart` and `/api/mobile/payment` 404; current app uses local cart + manual bKash/Nagad TrxID via `/api/checkout`
- ⚠️ ADB gap: `adb` installed on VPS, but no phone visible; local laptop USB device is not exposed to the VPS
- Next: real device COD/bKash/Nagad checkout smoke, then EAS production AAB + Play Store internal testing upload

---

## 🔵 BACKLOG (post-freeze Jul 3+)

- Blog content at scale: 51 posts vs Shajgoj 5,904
- UCP/MCP commerce endpoint: build when reviews > 200 (currently 5)
- Critical CSS (critters): DEV_MASTER W6
- Origin editorial: UK, France, Bangladesh, others — owner confirms list
- FAQ quality improvement: top 200 products have templated answers (M4)
- getSeoDescription() code: add product.description (first 155 chars) as fallback tier between short_description and generic template — prevents any future product landing on the weak generic fallback
- GCP service account key rotation: fingerprint ce8b30ba

---

## ✅ COMPLETED THIS SESSION (2026-06-05)

- Checkout order creation hardened: Next `/api/checkout` now uses secret-protected WP mu-plugin `/wp-json/emart/v1/create-order`; WC REST key order-create dependency removed from live checkout path; direct plugin smoke + full BFF checkout smoke passed; test order/user cleaned up
- FAQPage JSON-LD on 9 concern pages
- Product schema description decoupled (400-500c when humanized)
- agents.md live at /agents.md (FB: emartbd.official, YT: @emartbd.official)
- Sunscreen category copy (M7) — all missing terms added
- Review form: all logged-in users can submit (aggregateRating unblocked)
- InitiateCheckout Meta Pixel event added — full event set complete
- BHA/salicylic ingredient redirects — fixes GSC position drop
- H2 on /sale, /new-arrivals, /brands (DEV_MASTER L4)
- M6 internal links: niacinamide, hyaluronic-acid, acne-blemish-care, dryness-hydration
- SEO_MASTER M7+M8 closed, W7 scripts archived
- GMC: 53 product descriptions fixed (9 rule-based + 44 LLM) → 127→107 disapproved
- X2 impression-priority humanizer: 10 reviewed products applied; DB verified; ISR revalidated
- Homepage LCP/TBT pass: First Load JS 157→108 kB; final post-removal Lighthouse mobile score 96, LCP 2.2s, TBT 170ms
- Homepage SEO link-hub experiment reverted: visible `Popular skincare paths` block removed in `2e8b45b`; no new visible homepage/design/layout sections during freeze without owner approval
- OWNER-ACTIONS-20260605.md + CODEX-GMC-FIX-20260605.md + gmc-steps3-6-report-20260605.md

---

## 🔑 Key Rules

**WC API Key:** key_id `39` ("Emart BFF Live") in `.env.local`. Never delete without updating .env.local first.
**Freeze:** Structural/nav frozen until 2026-07-03. Content, data, new features, automation: OK.
**Deploy order:** Local build → commit → rsync → VPS build → pm2 restart → smoke test → push.
**Humanizer priority:** Always by GSC impression count, not category order.
**GMC sync:** Always last — after all description fixes verified.
