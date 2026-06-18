# Kbazar24 - Claude/Codex Project Notes

This project is Kbazar24, not Emart. Kbazar is a **self-maintaining fork** of Emart — it runs independently. Do not bulk-sync from Emart; only cherry-pick specific files when needed.

Use `/root/kbazar24-platform` as the local source and `/var/www/kbazar24-platform` as the runtime copy. The live domain is `https://kbazar24.com`; the PM2 process is `kbazar24web`; the WordPress backend is `/var/www/kbazar24-wp`; loopback REST is `http://127.0.0.1:8082`.

## Lean setup

- **No local node_modules or .next** — builds happen on VPS only.
- **No local build step** — `deploy.sh` rsyncs source to VPS, builds there.
- **Do not open in VS Code** as a regular workspace. Open only when troubleshooting.
- PM2 runs with `--max-memory-restart 256M` via `npm start`.

## Before editing, read:

- `apps/web/.agent-memory/MEMORY.md`
- tail of `apps/web/SESSION-LOG.md`
- `workspace/TASKS.md`
- `git status --short`

## Important rules

- Do not use Emart deploy paths, process names, remotes, or public copy.
- Do not commit `.env.local` or secrets.
- Do not modify Woo product/order/customer/stock/price data without explicit owner request.
- Do not run `npm install` or `npm run build` on the local tree — no node_modules here.
- Keep `_emart_*` backend meta/endpoints only where needed for the cloned WordPress integration. Public brand surfaces should say Kbazar.

## Deploy (builds on VPS, not locally)

```bash
./deploy.sh "fix: short description"
```

## Cherry-pick from Emart (selective, not bulk)

```bash
# See what differs:
./workspace/scripts/sync-from-emart.sh --list

# Diff a specific file:
./workspace/scripts/sync-from-emart.sh --diff src/components/Footer.tsx

# Copy specific files/dirs (paths relative to apps/web/):
./workspace/scripts/sync-from-emart.sh src/lib/woo.ts src/components/checkout
```

## Minimum smoke

```bash
curl -fsS -o /dev/null -w "%{http_code}\n" https://kbazar24.com/
curl -fsS -o /dev/null -w "%{http_code}\n" https://kbazar24.com/shop
curl -fsS -o /dev/null -w "%{http_code}\n" https://kbazar24.com/category/face-cleansers
curl -fsS https://kbazar24.com/agents.md | head
curl -fsS https://kbazar24.com/llms.txt | head
```
