# Mobile M2/M3/M4 Audit — 2026-05-25

## M2 — Direct WooCommerce / WordPress Calls

Result: clean.

Search in `apps/mobile/src/` found zero active-source matches for:

- `wp-json`
- `/wc/v3`
- `WOO_*`
- `CONSUMER_KEY`
- `CONSUMER_SECRET`
- `WC_*`
- `e-mart.com.bd/wp-json`
- backend/internal WordPress IP patterns

Current mobile API flow:

- Product lists/details/categories/coupons use `apps/mobile/src/services/woocommerce.js` through `/api/mobile/*`.
- Reviews use `/api/product-reviews`.
- Checkout order creation uses `/api/checkout`.
- Mobile ships no WooCommerce consumer key/secret.

## M3 — Mobile Checkout Smoke

Live emulator/device smoke was not completed in this VPS session because no Android emulator, `adb`, iOS simulator, or physical device is available in the environment.

Code audit result: checkout call chain is wired.

- `apps/mobile/src/screens/CheckoutScreen.js` defines visible payment options for Cash on Delivery, bKash, and Nagad.
- COD is the default selected method.
- bKash/Nagad require a transaction ID before submit.
- `apps/mobile/src/services/woocommerce.js` sends order payloads to `/api/checkout`.
- `apps/web/src/app/api/checkout/route.ts` validates the payload, calculates shipping, ensures a customer account, and calls `createOrder`.
- `apps/web/src/lib/woocommerce.ts` creates the WooCommerce order through the server-side write client and sets COD orders to `processing`; non-COD orders are `pending`.

Remaining validation needed: run on a real device/emulator, place one COD test order, verify returned order ID, and confirm the order appears in WooCommerce admin.

## M4 — Push Notifications

What is wired:

- Expo notifications dependency and plugin are present.
- Android notification permission, icon, color, and Expo project ID are configured in `apps/mobile/app.json`.
- App-level foreground notification handler/listeners exist in `apps/mobile/App.js`.
- `apps/mobile/src/screens/NotificationsScreen.js` can request permission, create an Android channel, call `Notifications.getExpoPushTokenAsync`, and store local preferences/token in AsyncStorage.

What is missing:

- The token is not sent to the backend. The code still has a TODO at token registration.
- There is no `/api/mobile/*` endpoint for push token registration or preference updates.
- No WordPress/mu-plugin storage table/meta handler for mobile push tokens was found.
- No server-side sender/trigger was found for order status updates, promos, deals, or new arrivals.
- Notification tap navigation to order history is only stubbed in `App.js`.

Conclusion: client-side Expo token acquisition is partially wired, but push notifications are not functional end-to-end until backend registration, storage, sender triggers, and tap-routing are built.
