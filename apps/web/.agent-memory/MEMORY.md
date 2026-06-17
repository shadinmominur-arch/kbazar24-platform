# Kbazar24 Agent Memory

- Project: **Kbazar24 / Kbazar Korean Cosmetics Store** at `https://kbazar24.com`.
- Local source: `/root/kbazar24-platform`; VPS runtime: `/var/www/kbazar24-platform`; WordPress backend: `/var/www/kbazar24-wp`.
- Frontend: Next.js 14.2.x, React 18, Tailwind 3, TypeScript. PM2 process: `kbazar24web`, bound to `127.0.0.1:3003`.
- Backend data source: WooCommerce/WordPress on loopback `http://127.0.0.1:8082`; public site URL should be `https://kbazar24.com`.
- This project was forked from Emart and still has many inherited Emart docs, names, mu-plugin endpoints, meta keys, storage keys, and deploy assumptions. Do not blindly apply Emart deploy scripts or task state.
- Claude may be working in this repo concurrently. Before editing, run `git status --short` and inspect recent changes. Avoid broad rebrand sweeps while another agent is active.
- Current high-priority audit findings from 2026-06-17:
  - `deploy.sh`, root `AGENTS.md`, root `CLAUDE.md`, `package.json`, and `ecosystem.config.js` are now Kbazar-specific.
  - `@next/third-parties` is pinned to `14.2.35` to match Next 14.2.35.
  - Public old Emart support/WhatsApp numbers in tracked frontend files were replaced with Kbazar number `01723659703`.
  - `/wp-login.php`, `/wp-admin`, and `/wp-admin/` are restricted in Nginx to owner IP `103.197.153.14` so the owner can use the normal WordPress login without a browser basic-auth prompt. Other IPs receive 403.
  - Runtime PM2 is online and listening on loopback only: `127.0.0.1:3003`.
  - Woo category fetch errors are sanitized before throwing from cached functions so build/runtime logs do not dump Axios config or Woo credentials.
  - Live smoke passed after deploy: `/`, `/shop`, `/category/face-cleansers`, `/agents.md`, `/llms.txt`, `/sitemap.xml`, `/robots.txt` all returned 200; `/wp-login.php` returns 403 outside the owner IP allowlist.
  - Remaining ops risk: PHP-FPM has shown `pm.max_children` warnings under load; tune after checking memory headroom.
  - Remaining owner action: rotate `ADMIN_PASSWORD`, courier keys, and any other inherited secrets in `.env.local`.
- Preserve operational backend keys such as `_emart_*` or `/wp-json/emart/v1/*` only if the cloned WordPress plugins still require them. Public-facing brand/copy/SEO should be Kbazar-specific.
- Do not touch Woo product/order/customer/stock/price data without explicit user request.
