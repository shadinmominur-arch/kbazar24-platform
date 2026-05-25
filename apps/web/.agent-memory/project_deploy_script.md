---
name: project_deploy_script
description: deploy.sh one-command deploy script at /root/emart-platform/deploy.sh — use instead of manual rsync steps
metadata: 
  node_type: memory
  type: project
  originSessionId: af57b72d-7d82-49ee-8e6d-b9b8d3bd6b5a
---

`/root/emart-platform/deploy.sh` is the canonical one-command deploy for this project.

**Usage:**
- `./deploy.sh "commit message"` — full deploy with commit
- `./deploy.sh --no-commit` — rsync + build + restart only (idempotent, good for recovery)

**What it does:** Local build → git commit → rsync Local→VPS → VPS npm install (if needed) → VPS build → pm2 restart → smoke test curl → git push origin main only if smoke passes.

**Why:** Replaces the error-prone manual multi-step sequence; smoke test gates the push so bad code never reaches origin.
**How to apply:** Always run from `/root/emart-platform`. Do not manually rsync or push — run `./deploy.sh` instead.
