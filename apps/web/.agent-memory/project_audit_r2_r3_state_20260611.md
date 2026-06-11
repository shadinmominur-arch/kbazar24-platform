# R2/R3 audit state - 2026-06-11

- R2/H-05 is done/live. Runtime Nginx restores Cloudflare real client IPs via `/etc/nginx/conf.d/cloudflare-real-ip.conf` (repo reference `workspace/docs/R2-cloudflare-real-ip-nginx.conf`), rate-limits checkout/admin-auth/newsletter/search/auth/general buckets, and exempts localhost/VPS IP for `emart-checkout-monitor`.
- R3/H-06 is still pending owner Cloudflare dashboard work. Owner attempted setup, but live recheck still reached WordPress directly: `/wp-login.php` returned HTTP 200 and `/wp-admin/` redirected to `/wp-login.php?redirect_to=...`.
- Likely fix: Cloudflare Zero Trust Access app must include `e-mart.com.bd` paths `/wp-login.php*` and `/wp-admin/*`; the star on `/wp-login.php*` matters because WordPress adds query strings such as `?redirect_to=...&reauth=1`.
- Do not mark pre-freeze audit fully closed until a fresh unauthenticated live check shows Cloudflare Access challenge/redirect instead of WordPress headers/cookies on both `/wp-login.php` and `/wp-admin/`.
