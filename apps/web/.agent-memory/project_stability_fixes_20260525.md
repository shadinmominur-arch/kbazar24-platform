---
name: project_stability_fixes_20260525
description: "Stability fixes deployed 2026-05-25 — review, cache, and deployment version check"
metadata: 
  node_type: memory
  type: project
  originSessionId: af57b72d-7d82-49ee-8e6d-b9b8d3bd6b5a
---

Three stability improvements deployed in this session:

1. **ReviewsSection.tsx** — stuck submit button on network failure fixed with try/catch/finally
2. **woocommerce.ts** — `getCategories` wrapped in `unstable_cache` (1hr TTL) to fix 8s timeout errors
3. **useDeploymentCheck.tsx + /api/version/route.ts** — new deployment version check; shows tap-to-refresh toast within 5 min of a new deploy; wired up in `runtime-widgets.tsx`

**Why:** ReviewsSection had no error cleanup; category fetch was timing out under load; users were served stale UI after deploys.
**How to apply:** Do not remove the unstable_cache wrapper from getCategories — it was added deliberately for timeout relief.
