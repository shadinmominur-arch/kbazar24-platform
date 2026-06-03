---
name: Current Local/VPS/Git/Live State - 2026-06-03
description: Latest verified Emart state after humanizer batch, Mary&May redirect fix, and Playwright MCP setup
type: project
---

Verified on 2026-06-03 after Codex work.

Git/source state:
- Local `/root/emart-platform`: `bc3ab0c` on `main`, clean at check time after memory update.
- Origin `main`: `bc3ab0c9e0109fde14cdfba60f094c37ad6092c5` (`bc3ab0c docs(memory): update live server state`).
- Recent commits:
  - `bc3ab0c docs(memory): update live server state`
  - `e4a1bc7 chore(mcp): add Playwright MCP config`
  - `283772d docs(humanizer): update face cleanser batch status`
  - `1cbdc3d fix(redirect): restore Mary&May cleanser product URL`

VPS/runtime state:
- Runtime tree `/var/www/emart-platform` has latest synced live files for `apps/web/next.config.js`, `apps/web/SESSION-LOG.md`, and `workspace/TASKS.md`.
- VPS git metadata was still at `b8cdb2f` with dirty synced files at check time:
  - `M apps/web/SESSION-LOG.md`
  - `M apps/web/next.config.js`
  - `M workspace/TASKS.md`
- Treat VPS git SHA as stale bookkeeping until explicitly aligned; live runtime files are newer than VPS git HEAD.

Live site/process state:
- `https://e-mart.com.bd/` smoke returned HTTP 200.
- PM2 `emartweb` online, PID `2437128`, restarted after VPS build for `1cbdc3d`.
- PM2 `emart-presence` online.
- PM2 `n8n` and `medimartweb` also online.

Humanizer state:
- No active humanizer/background process at final check.
- Face cleanser progress: `169/218` humanized.
- Holdout remains 13 and must not be touched.
- High-sales products remain protected.
- Applied/verified on 2026-06-03: 15 face-cleanser products. Final live verification passed for all 15: HTTP 200, meta 130-158 chars, all 6 required `<h3>` sections, and `product-disclaimer` present.
- Remaining products mostly failed generation validation (`near-duplicate second clause`, overlong meta, or API length errors); they were not written/applied.

Redirect fix:
- Removed bad permanent redirect from `/shop/maryampmay-white-collagen-cleansing-foam-150ml` to stale `/shop/marymay-blackberry-complex-glow-washoff-pack-125g`.
- The Mary&May cleanser PDP now resolves live with updated humanized content.

Playwright MCP:
- `.mcp.json` is tracked and safe; it defines Playwright MCP via `npx -y @playwright/mcp@latest --headless --isolated --no-sandbox --browser chromium`.
- `.playwright-mcp/` and `*mcp-test.png` are ignored as generated local artifacts.
