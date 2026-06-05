# Emart Mobile Play Store Audit + Submission Guide

Last updated: 2026-06-05

## Current Build Target

- App: `eMart BD`
- Package: `com.emartbd.app`
- Expo SDK: `52.0.0`
- App version: `1.1.1`
- EAS/Play version code: remote `23` is OK
- Android target SDK: `35`
- Build source: GitHub `main`, base directory `apps/mobile`
- EAS account: `warlord71`

## Policy Audit

### Pass

- Target SDK is API 35, matching Google Play's current Android 15 submission requirement for new apps and updates.
- No direct WooCommerce keys, consumer secrets, or direct `/wp-json/wc/v3` calls are shipped in `apps/mobile`.
- Permissions are minimal: `NOTIFICATIONS` and `VIBRATE` only.
- No camera, microphone, contacts, precise location, SMS, call log, files/photos, or background location permissions.
- Privacy Policy URL exists: `https://e-mart.com.bd/privacy-policy`.
- Terms URL exists: `https://e-mart.com.bd/terms-conditions`.
- In-app Settings now links to Privacy Policy and Terms.
- No ads SDK detected.
- No in-app purchases detected.
- No health/medical claims or regulated healthcare functionality in the app UI.

### Needs Owner/Console Action

- Complete Play Console Data safety accurately. Do not mark "no data collected".
- Complete Content rating questionnaire.
- Complete Target audience: select adults/general shoppers, not children-directed.
- Add App access instructions if review needs login or checkout testing.
- Upload screenshots and feature graphic.
- Ensure Play Console privacy policy field is exactly `https://e-mart.com.bd/privacy-policy`.

### Risk Notes

- Push notifications are optional, but the app can request notification permission and can create/store an Expo push token locally. If backend token upload is not implemented yet, disclose only what is actually collected/transmitted. If future backend token upload is added, update Data safety.
- Google Sign-In fetches Google profile info: name, email, avatar. Disclose this as personal info collected for account management.
- Checkout collects name, email, phone, delivery address, order contents, and payment method/transaction ID for order processing.
- Local AsyncStorage stores cart, orders, language, auth session token, and notification preferences on device.

## Data Safety Answers

Use this as the Play Console Data safety form baseline.

### Data Collection

Answer: **Yes, this app collects user data.**

Data types:

- Personal info
  - Name
  - Email address
  - Phone number
  - Address
- Financial info
  - User payment info: only bKash/Nagad transaction ID/payment method notes; card details are not collected in the mobile app.
- App activity
  - App interactions / in-app search/cart/order interactions, if logged through server order APIs.
- App info and performance
  - Crash logs/diagnostics only if Expo/Play collects them for release diagnostics.
- Device or other IDs
  - Push notification token only if notification token is sent to backend in a future release. Current code stores token locally and has TODO for backend upload.

Purposes:

- Account management
- App functionality
- Order processing and delivery
- Customer support
- Fraud prevention/security
- Developer communications
- Marketing/promotions only for optional notifications or consented communications

### Data Sharing

Answer conservatively:

- Shared with courier/logistics partners: name, phone, delivery address, order details for delivery.
- Shared with payment processors/mobile payment partners where needed for payment/order support.
- Shared with Google only where user uses Google Sign-In or Play/Expo platform services.

Do **not** claim "no sharing" if courier/payment fulfillment data is used operationally.

### Security Practices

- Data encrypted in transit: **Yes**. App uses HTTPS API base URL.
- Users can request data deletion: **Yes**, via support email in privacy policy. Add/confirm a direct account deletion process in support workflow.
- Data is optional? Mixed:
  - Account login optional for browsing.
  - Checkout data required for order placement.
  - Notifications optional.

## Play Store Listing Copy

### App Name

`Emart Skincare Bangladesh`

If the Play Console app title limit blocks this, use:

`Emart BD`

### Short Description

`Authentic Korean & global beauty. COD available.`

### Long Description

Emart Skincare Bangladesh is an online beauty shopping app for authentic Korean, Japanese, and global skincare products in Bangladesh.

Shop popular skincare, sunscreen, cleansers, serums, moisturisers, masks, hair care, and beauty essentials with prices in BDT. Browse products, search by category, add items to cart, and place orders from your phone.

Why shop with Emart:

- Authentic Korean, Japanese, and global beauty products
- Cash on Delivery available
- bKash and Nagad merchant payment support
- Delivery across Bangladesh
- Product details, prices, images, ratings, and reviews
- English and Bangla app experience
- Customer support by phone, email, and WhatsApp

Emart is operated by HG Corporation in Dhaka, Bangladesh. We focus on genuine products, practical skincare shopping, and local support for Bangladeshi customers.

Privacy Policy: https://e-mart.com.bd/privacy-policy

### Bengali Short Description

`অথেনটিক কোরিয়ান ও গ্লোবাল বিউটি। ক্যাশ অন ডেলিভারি।`

### Bengali Long Description

Emart Skincare Bangladesh অ্যাপে আপনি অথেনটিক কোরিয়ান, জাপানি ও গ্লোবাল স্কিনকেয়ার পণ্য কিনতে পারবেন।

স্কিনকেয়ার, সানস্ক্রিন, ক্লেনজার, সিরাম, ময়েশ্চারাইজার, মাস্ক, হেয়ার কেয়ার ও বিউটি পণ্য ব্রাউজ করুন, কার্টে যোগ করুন এবং মোবাইল থেকেই অর্ডার করুন।

সুবিধা:

- অথেনটিক কোরিয়ান, জাপানি ও গ্লোবাল বিউটি পণ্য
- ক্যাশ অন ডেলিভারি
- বিকাশ ও নগদ merchant payment
- বাংলাদেশজুড়ে ডেলিভারি
- পণ্যের ছবি, দাম, বিবরণ, রেটিং ও রিভিউ
- বাংলা ও ইংরেজি সাপোর্ট
- ফোন, ইমেইল ও WhatsApp কাস্টমার সাপোর্ট

Privacy Policy: https://e-mart.com.bd/privacy-policy

## Store Assets Needed

- App icon: already configured, 1024x1024.
- Adaptive icon: already configured, 1024x1024.
- Feature graphic: **needed**, 1024x500 PNG/JPG.
- Phone screenshots: at least 2, recommended 6-8.
  - Home
  - Product listing/search
  - Product detail
  - Cart
  - Checkout
  - Order success
  - Account/support
- Optional 7-inch/10-inch tablet screenshots: only if targeting tablets. Current iOS tablet off; Android no tablet exclusion. Phone screenshots are enough for mobile-first release.

## Play Console Step-by-Step

1. Open Play Console under `warlord71`.
2. Select the Emart app or create app:
   - App name: `Emart Skincare Bangladesh`
   - Default language: English (United States) or English
   - App type: App
   - Free/Paid: Free
   - Declarations: confirm Developer Program Policies and US export laws.
3. Go to **Setup > App integrity**:
   - Enable/confirm Play App Signing.
   - Use EAS managed signing unless Play Console already owns signing.
4. Go to **Policy and programs > App content**:
   - Privacy Policy: `https://e-mart.com.bd/privacy-policy`
   - Ads: No
   - App access: provide test instructions if login/checkout review is needed.
   - Data safety: use the answers above.
   - Content rating: complete questionnaire as shopping/e-commerce/beauty, no gambling, no violence, no adult content.
   - Target audience: choose adults/general audience, not children-directed.
   - News apps: No
   - COVID/contact tracing/health declarations: No
   - Financial features: No lending/credit/financial product. Mobile payment methods are order payment support only.
5. Go to **Store presence > Main store listing**:
   - Add app name, short description, long description.
   - Upload app icon and feature graphic.
   - Upload phone screenshots.
   - Add contact email: `support@e-mart.com.bd`.
   - Add website: `https://e-mart.com.bd`.
   - Add phone if requested: `+8801919797399`.
6. Build from Expo:
   - Account: `warlord71`
   - Source: GitHub `main`
   - Base directory: `apps/mobile`
   - Profile: `production`
   - Platform: Android
7. After EAS build completes:
   - Download the `.aab` or use EAS Submit if configured.
   - Play Console > **Testing > Internal testing** > Create new release.
   - Upload AAB.
   - Add release notes:
     `Initial Emart mobile shopping release with product browsing, cart, checkout, account, reviews, and support.`
   - Save and review release.
   - Roll out to internal testing.
8. Add testers:
   - Create email list or Google Group.
   - Copy opt-in link and test install from Play Store.
9. Internal test checklist:
   - Install from Play Store internal testing link.
   - Open app fresh.
   - Browse home/product list.
   - Open product detail.
   - Add to cart.
   - Checkout COD with test customer info if owner approves test order.
   - Try bKash/Nagad transaction ID validation.
   - Login/register flow.
   - Review form prompts sign-in.
   - Privacy Policy and Terms open from Settings.
10. Production:
   - Fix any Play pre-launch report crashes/warnings.
   - Create production release from the tested AAB or promote the internal release.
   - Roll out gradually if available.

## Fast Pre-Submission Commands

Run before building:

```bash
cd /root/emart-platform/apps/mobile
npx expo-doctor
npx expo export --platform android --output-dir /tmp/emart-mobile-export
```

Current known result on 2026-06-05:

- `expo-doctor`: 18/18 passed
- Android export: passed

## Do Not Submit If

- Privacy Policy URL returns 404 or does not mention Emart/HG Corporation.
- Data safety says "no data collected".
- App listing says Card/SSLCommerz before SSLCommerz is implemented.
- App contains WooCommerce keys or direct Woo REST credentials.
- Target SDK drops below 35.
- Internal testing build crashes on launch.
