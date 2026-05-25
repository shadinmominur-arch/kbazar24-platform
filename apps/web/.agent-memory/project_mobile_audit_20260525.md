---
name: project_mobile_audit_20260525
description: "Mobile app API and push notification audit — M2 clean, M4 partial, M3 blocked on device"
metadata: 
  node_type: memory
  type: project
  originSessionId: af57b72d-7d82-49ee-8e6d-b9b8d3bd6b5a
---

## M2: Clean — completed 2026-05-25 (Codex, commit ae91593)

`apps/mobile/src` has zero direct `wp-json`, `/wc/v3`, WooCommerce credential env vars, or backend IP references. All API calls go through Next.js BFF (`/api/mobile/*`, `/api/checkout`, `/api/product-reviews`).

## M4: Push notifications — partial, backend missing

**Client side (wired):** `expo-notifications`, app handler/listeners, Android channel, Expo push-token request, local AsyncStorage preferences.

**Backend (missing, needs owner approval before building):**
- Token registration endpoint
- WP/backend token storage
- Push sender triggers for order status and promos
- Completed tap navigation on notification open

Do not build missing pieces without explicit owner approval — it's a separate task.

## M3: Mobile checkout smoke test — blocked on hardware

Code path audited: mobile checkout posts to `/api/checkout` → `lib/woocommerce.ts createOrder`. COD, bKash, Nagad are all wired in the checkout screen. Cannot run live end-to-end test — no emulator, adb, iOS simulator, or physical device on this VPS.

**Remaining:** run on real device, place COD test order, verify WooCommerce admin receives the order_id.

## Price normalize: closed — no action needed

Dry-run (2026-05-25) found zero published products with `_regular_price` 0.00 or 1.00. No Woo DB writes needed. Report: `workspace/audit/active/price-normalize-summary-20260525.md`.
