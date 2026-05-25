---
name: project_dev_master
description: DEV_MASTER.md stack version reference + hard hold list — read before touching any dependency
metadata: 
  node_type: memory
  type: project
  originSessionId: af57b72d-7d82-49ee-8e6d-b9b8d3bd6b5a
---

`workspace/DEV_MASTER.md` is the authoritative stack version reference for this project.

## Hard holds (DO NOT upgrade until cleared)

These are frozen until **2026-07-03** minimum:

| Package | Current | Reason |
|---|---|---|
| Next.js | 14.x | Next 15 has breaking changes in App Router |
| React | 18.x | React 19 requires ecosystem-wide testing |
| Tailwind | 3.x | Tailwind 4 has breaking config changes |
| Zustand | 4.x | Zustand 5 has breaking API |
| NextAuth | 4.x | NextAuth 5 is a full rewrite |
| lucide-react | 0.x | 1.x renames many icons used site-wide |
| ESLint | 8.x | ESLint 9 has breaking flat config |
| WordPress | 6.x | WordPress 7.0 — hold until WooCommerce compatibility confirmed |

## Safe to update (minor/patch only)

axios, @tanstack/react-query, postcss, autoprefixer, next-auth, @typescript-eslint/*, @types/react, @next/third-parties, @types/node (already bumped to ^22 to match VPS Node 22 LTS).

**Why:** Previous npm update in commit `f2acdd7` proved safe; hard holds exist to protect a stable live site.
**How to apply:** Check DEV_MASTER.md before any `npm install` or package.json edit. Never major-version the holds.
