---
name: emart-seo-generator
version: 2.0.0
description: "Generate complete SEO content (title, meta, descriptions, on-page Q&A, Rank Math fields, alt texts) for E-Mart BD products and category pages targeting Bangladeshi customers. Intent-aware: handles product (PDP), category/collection, and editorial pages differently. Use when: user says 'SEO করো', 'generate SEO for', 'নতুন পণ্যের SEO দরকার', a category page needs a real buying guide, or a new WooCommerce product is added with empty description fields."
metadata:
  openclaw:
    emoji: "📝"
    requires:
      env:
        - WOOCOMMERCE_URL
        - WOOCOMMERCE_KEY
        - WOOCOMMERCE_SECRET
        - TELEGRAM_BOT_TOKEN
        - TELEGRAM_CHAT_ID
      bins:
        - curl
    primaryEnv: WOOCOMMERCE_KEY
---

# E-Mart BD — SEO Content Generator (v2)

## Purpose
Generate SEO content for the Bangladeshi market that reads as written by a
knowledgeable local team — not templated AI filler. Follows E-E-A-T, states
facts accurately, and matches depth to search intent.

## NON-NEGOTIABLE RULES (apply to every output)

### Positioning
- E-Mart is **"authentic global brands · K-beauty focused"** — NEVER framed as
  Korean-only or Korean/Japanese-only. Never "Direct from Seoul & Tokyo."
- A product's **own** country of origin IS stated accurately (COSRX → Korea,
  CeraVe → USA, Simple → UK, The Derma Co → India, etc.). Do NOT label a
  non-Korean product as "Korean." Pull origin from product data / brand; if
  unknown, omit origin rather than guess.
- One canonical brand name in output: **"Emart Skincare Bangladesh"** (or
  "Emart" in running text). Never emit concatenated tokens like
  "Emart EmartAuthentic Emart Skincare BD".

### Claims & sources (skincare = health-adjacent / YMYL)
- Every efficacy or ingredient claim is either (a) general, widely-accepted
  skincare knowledge stated plainly, or (b) backed by a real primary source.
- NEVER invent studies, percentages, "clinically proven X%", or statistics.
  If you don't have a real figure, don't state one.
- No medical/treatment promises ("cures acne", "removes melasma"). Use
  "helps with", "supports", "may reduce the look of".
- Never write "whitening" → use "brightening" / "উজ্জ্বলতা".

### AI-slop ban list (reject these in EN copy)
delve, leverage, robust, elevate, unlock, "game-changer", "look no further",
"in today's world", "when it comes to", "nestled", "a testament to",
"navigate the world of", "say goodbye to", "the perfect", "boasts",
"crafted", "seamless", "bustling". Bangla tells to avoid: mechanical
"আপনার জন্য সঠিক সমাধান", repeated "অসাধারণ"/"চমৎকার" filler.

### FAQ / Q&A (UPDATED — read this)
- FAQ rich results were fully removed from Google Search on **7 May 2026**.
  FAQPage schema is still valid and still parsed, but it produces NO visible
  SERP feature. Do not add it expecting rich snippets.
- DO write a real Q&A block as **on-page H2/H3 question headers with concise
  answers** — this is what helps AI Overview, Gemini, and ChatGPT cite the page.
- Questions must be NLP-friendly (the way a BD shopper actually types/asks),
  with a tight 1–3 sentence answer each. No padding.

### Style
- First-person plural brand voice ("we") in store copy; authoritative,
  cited tone on ingredient/efficacy explanations. Short paragraphs.
- No throat-clearing intros. Open with the answer/value.
- Bangla/English mix ≈ 60/40, natural — not sentence-by-sentence translation.
- Don't pad to a word count. Match depth to intent.

---

## STEP 0 — Classify intent FIRST
Decide which generator to run:
- **PDP** (single product) → Section A
- **CATEGORY / collection** (e.g. /category/face-cleansers) → Section B
- **EDITORIAL** (guide / best / compare / concern / ingredient) → Section C
Then run only that section. Never apply blog-style depth to a PDP, or PDP
boilerplate to a category.

---

## SECTION A — PRODUCT (PDP)

### A1 Data
If ID: `GET $WOOCOMMERCE_URL/wp-json/wc/v3/products/{id}` → name, brand,
category, price, images, SKU, existing copy, **origin/brand country**.
If name only: web-search the official brand page for INCI, claims, origin.

### A2 Title (50–60 chars)
`{Brand} {Product} {Size} | {Key Benefit} Bangladesh`
e.g. `COSRX Low pH Good Morning Cleanser 150ml | Gentle Gel BD`
No stuffing. "Bangladesh"/"BD" once.

### A3 Meta description (140–155 chars)
Lead with what it is + who it's for + a real differentiator (authentic, COD,
BDT). Avoid "best price" superlatives. One natural sentence.

### A4 Short description (HTML)
```html
<ul>
  <li>✨ <strong>মূল উপাদান:</strong> {key_ingredient}</li>
  <li>💧 <strong>উপকারিতা:</strong> {benefit_1}, {benefit_2}</li>
  <li>🌿 <strong>ত্বকের ধরন:</strong> {skin_type}</li>
  <li>🌍 <strong>উৎস:</strong> {ACTUAL origin country} — ১০০% অথেনটিক</li>
  <li>🚚 <strong>ডেলিভারি:</strong> ঢাকায় ১-২ দিন, সারা বাংলাদেশে ৩-৫ দিন</li>
</ul>
```
(Note the origin line uses the product's REAL country, no fixed flag.)

### A5 Long description (HTML)
```html
<h2>{Product} — কী, কেন, কীভাবে</h2>
<p>{2–3 plain sentences: what it is, what problem it solves. No fluff.}</p>

<h3>বাংলাদেশের আবহাওয়ায় কেন উপযুক্ত</h3>
<p>{Tie to BD reality: humidity, heat, pollution, hard water — concrete, not generic.}</p>

<h3>মূল উপাদান ও কাজ</h3>
<ul><li><strong>{ingredient}:</strong> {accurate, non-overclaimed benefit}</li></ul>

<h3>ব্যবহারের নিয়ম</h3>
<ol><li>{step}</li></ol>

<h2>সচরাচর জিজ্ঞাসা</h2>
<h3>{NLP-friendly question a BD buyer would type}</h3>
<p>{1–3 sentence answer}</p>
<!-- 3–5 product-specific questions; reuse generic authenticity/delivery only if relevant -->
```

### A6 Image alt texts (UNIQUE per image — no repeated stuffed phrase)
```
Main:    "{brand} {product} {size} — front of pack"
Texture: "{product} texture / consistency"
Ingred:  "{product} key ingredients panel"
Usage:   "{product} applied to skin"
```
NEVER append the same "…price in Bangladesh at Emart" string to every card.

### A7 Rank Math / Yoast
```
Focus Keyword: {primary}
Secondary: {kw2}, {kw3}
Schema Type: Product   (ensure offers, priceValidUntil, and aggregateRating
                        when ≥1 real review exists)
```

---

## SECTION B — CATEGORY / COLLECTION

### B1 Title & meta — keep current quality (it works)
`{Category} in Bangladesh | Emart` + a specific description naming the
sub-types and skin types in that category. Drop the `meta-keywords` tag
entirely (Google ignores it).

### B2 Intro (top of grid, ~50–70 words) — keep this style, it's good
What's in the collection + who it's for + authentic/BDT/COD. Frame any
Korean items as part of a global range, not the whole store.

### B3 Buying guide (bottom) — **REPLACE the boilerplate with REAL guidance**
This block must be UNIQUE per category and actually help someone choose.
NOT the "Emart is Bangladesh's trusted source for authentic {X}…" clone.
Structure:
```html
<h2>How to choose a {category} in Bangladesh</h2>
<p>{1–2 sentences: the main decision axis for this category.}</p>
<h3>By skin type</h3>
<ul><li><strong>Oily / acne-prone:</strong> {what to look for + 1 real pick from catalog}</li>
    <li><strong>Dry / sensitive:</strong> {…}</li></ul>
<h3>What to look for</h3>
<p>{Category-specific: e.g. for cleansers — low pH, sulphate-free, gel vs foam vs oil.}</p>
<h2>সচরাচর জিজ্ঞাসা</h2>
<h3>{2–3 NLP-friendly questions specific to this category}</h3><p>{tight answer}</p>
```
A short trust line (authentic, COD, Dhanmondi-verified) may appear ONCE,
small, not as the whole "guide".

---

## SECTION C — EDITORIAL (guide / best / compare / concern / ingredient)
Apply full quality checklist:
1. Read the top ranking pages for the target query first; cover what 3+ of them
   cover, then add what none do.
2. Outline (headings, the data points, one real source per section) before drafting.
3. Match length to the top results — don't pad.
4. Problem→agitate→solution intro, **under 80 words**.
5. Every stat links to a primary source (brand INCI, peer-reviewed, gov/derm body).
   No "Top 10" roundup sources.
6. 5–10 internal links with real anchor text → relevant categories/PDPs/guides.
7. 4–5 real visuals (own product shots / diagrams), not stock or AI junk.
8. On-page Q&A: 9–12 questions for long-form, 5–6 for short, NLP-friendly.
9. Vary structure between posts so the cluster doesn't become uniform.

---

## STEP FINAL — QA PASS (run before any WooCommerce write)
Reject and regenerate if any are true:
- [ ] Any banned slop word present.
- [ ] Any invented stat/study/percentage, or medical overclaim.
- [ ] A non-Korean product labelled "Korean", or store framed Korean/Japanese-only.
- [ ] Category buying guide is the generic boilerplate clone (must be unique).
- [ ] Repeated stuffed alt/label phrase across product cards.
- [ ] Brand name emitted as concatenated tokens.
- [ ] Duplicate meta description vs another live page.
- [ ] FAQPage schema added "for rich results" (it produces none — on-page Q&A only).

---

## WooCommerce update
```
PUT $WOOCOMMERCE_URL/wp-json/wc/v3/products/{id}
{
  "name": "{seo_title}",
  "short_description": "{short_desc_html}",
  "description": "{long_desc_html}",
  "meta_data": [
    {"key": "_yoast_wpseo_title",    "value": "{seo_title}"},
    {"key": "_yoast_wpseo_metadesc", "value": "{meta_description}"},
    {"key": "rank_math_focus_keyword","value": "{focus_keyword}"},
    {"key": "rank_math_description", "value": "{meta_description}"}
  ]
}
```

## Telegram confirm
```
✅ SEO: {name}  [{intent}]
📝 {seo_title}
🔍 {focus_keyword}
🔗 {url}
QA: passed ✅
```

## Batch mode
CSV of IDs → max 10/batch, 30s delay, progress every 5. Run QA per item.

## Error handling
- Product not found → confirm ID.
- API write fails → send generated content to Telegram for manual paste.
- No ingredient/origin data → generate from type only, OMIT origin, flag for review.

## Changelog
- v2.0.0: intent classification (PDP/category/editorial); fixed Korean-only
  positioning + hardcoded "Korean origin" factual bug; real per-category buying
  guides replacing boilerplate; unique alt texts (no stuffed phrase); slop
  ban-list; claims/source rule; on-page Q&A replacing dead FAQ-rich-result claim;
  dropped meta-keywords; QA pass.
