# Kbazar24 Agent Memory

- Project: **Kbazar24 / Kbazar Korean Cosmetics Store** at `https://kbazar24.com`.
- Local source: `/root/kbazar24-platform`; VPS runtime: `/var/www/kbazar24-platform`; WordPress backend: `/var/www/kbazar24-wp`.
- Frontend: Next.js 14.2.x, React 18, Tailwind 3, TypeScript. PM2 process: `kbazar24web`, currently intended for port `3003`.
- Backend data source: WooCommerce/WordPress on loopback `http://127.0.0.1:8082`; public site URL should be `https://kbazar24.com`.
- This project was forked from Emart and still has many inherited Emart docs, names, mu-plugin endpoints, meta keys, storage keys, and deploy assumptions. Do not blindly apply Emart deploy scripts or task state.
- Claude may be working in this repo concurrently. Before editing, run `git status --short` and inspect recent changes. Avoid broad rebrand sweeps while another agent is active.
- Current high-priority audit findings from 2026-06-16:
  - Public `/agents.md` and `/llms.txt` still describe Emart and link to `e-mart.com.bd`.
  - `deploy.sh`, `ecosystem.config.js`, `package.json`, and root agent docs still identify Emart paths/processes.
  - `.env.local` is ignored by Git, but live-looking Woo/admin/courier secrets need rotation and stronger admin credentials.
  - `kbazar24web` is live, but build/runtime logs show repeated Woo/category/product timeouts.
  - Public `/wp-login.php` is reachable; decide Cloudflare Access/IP gate/no-public-admin policy before launch.
  - Public `/wp-json` behavior differs from loopback backend; verify Nginx routing intent.
  - Next process should bind to `127.0.0.1`, not `*:3003`, unless intentionally exposed and firewall-confirmed.
  - `@next/third-parties` is v16 while Next is v14; align dependency versions.
- Preserve operational backend keys such as `_emart_*` or `/wp-json/emart/v1/*` only if the cloned WordPress plugins still require them. Public-facing brand/copy/SEO should be Kbazar-specific.
- Do not touch Woo product/order/customer/stock/price data without explicit user request.
