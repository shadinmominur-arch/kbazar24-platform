# Kbazar24 - Claude/Codex Project Notes

This project is Kbazar24, not Emart.

Use `/root/kbazar24-platform` as the local source and `/var/www/kbazar24-platform` as the runtime copy. The live domain is `https://kbazar24.com`; the PM2 process is `kbazar24web`; the WordPress backend is `/var/www/kbazar24-wp`; loopback REST is `http://127.0.0.1:8082`.

Before editing, read:

- `apps/web/.agent-memory/MEMORY.md`
- tail of `apps/web/SESSION-LOG.md`
- `workspace/TASKS.md`
- `git status --short`

Important rules:

- Do not use Emart deploy paths, process names, remotes, or public copy.
- Do not commit `.env.local` or secrets.
- Do not modify Woo product/order/customer/stock/price data without explicit owner request.
- Coordinate with the other agent if the tree is dirty.
- Keep `_emart_*` backend meta/endpoints only where needed for the cloned WordPress integration. Public brand surfaces should say Kbazar.

Build command:

```bash
cd apps/web && npm run build
```

Deploy command, once verified:

```bash
./deploy.sh "fix: short description"
```

Minimum smoke:

```bash
curl -fsS -o /dev/null -w "%{http_code}\n" https://kbazar24.com/
curl -fsS -o /dev/null -w "%{http_code}\n" https://kbazar24.com/shop
curl -fsS -o /dev/null -w "%{http_code}\n" https://kbazar24.com/category/face-cleansers
curl -fsS https://kbazar24.com/agents.md | head
curl -fsS https://kbazar24.com/llms.txt | head
```
