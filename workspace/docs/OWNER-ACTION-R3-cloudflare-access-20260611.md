# Owner Action — R3: Cloudflare Access for wp-login.php (2026-06-11)

**Why:** Audit finding H-06 — `https://e-mart.com.bd/wp-login.php` returns HTTP 200 publicly,
exposing the WordPress backend (the headless architecture says backend should never be
public-facing) and giving brute-force attackers a target. Decision made: gate it with
**Cloudflare Access** (Zero Trust email one-time-code) rather than an IP allowlist, so
access works from any location/IP without risk of self-lockout.

**Cannot be automated from the VPS** — this is configured entirely in the Cloudflare
dashboard (no Cloudflare API token is available on this server). Takes ~5 minutes.

---

## Steps

1. Go to **Cloudflare dashboard → Zero Trust** (left sidebar; if Zero Trust isn't set up
   yet, it'll prompt a one-time team-name setup — any name works, e.g. `emart-bd`).
2. **Access → Applications → Add an application → Self-hosted**.
3. Configure:
   - **Application name:** `Emart WP Admin`
   - **Session duration:** 24h (or your preference)
   - **Domain:** `e-mart.com.bd`
   - **Path:** `/wp-login.php` — then add a **second** application (or additional path)
     for `/wp-admin/*` so the whole admin area is covered, not just the login page.
4. **Add policy**:
   - **Policy name:** `Owner only`
   - **Action:** Allow
   - **Include rule:** Emails → add `hgc.bd71@gmail.com` (and any other admin emails
     that need wp-admin access)
5. **Save**.

## Verify

1. Open an incognito/private browser window.
2. Visit `https://e-mart.com.bd/wp-login.php`.
3. Expect: a **Cloudflare Access** page asking for your email, then a one-time code
   sent to that inbox. Enter the code → you land on the normal WordPress login form.
4. Confirm `https://e-mart.com.bd/wp-admin/` behaves the same.
5. Confirm the **storefront** (`https://e-mart.com.bd/`, `/shop`, a product page) is
   **unaffected** — Access only applies to the configured paths.
6. Confirm any automation that posts to WordPress (MailPoet webhooks, REST API calls
   from Next.js BFF, GMC/GLA plugin syncs) still works — these typically use
   `/wp-json/*`, which is **not** in scope for this Access rule and stays as-is
   (already 403-blocked from outside per existing config).

## If something goes wrong

- If you get locked out of wp-admin entirely: in the Cloudflare dashboard, go to
  **Zero Trust → Access → Applications**, open `Emart WP Admin`, and either fix the
  policy email or temporarily delete the application — this immediately removes the
  gate and restores normal (public) access to `/wp-login.php`.

## After this is done

Reply to Claude/Codex with "R3 done" (or update `workspace/TASKS.md` directly) so the
audit remediation tracker can be closed out and a final live recheck of
`curl -sI https://e-mart.com.bd/wp-login.php` can confirm it now returns a Cloudflare
Access challenge instead of a bare 200.
