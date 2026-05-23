# WooCommerce API Key Rotation - 2026-05-23

Codex revoked the targeted exposed/stale WooCommerce API keys:

- `Mobile App Legacy Compatibility 2026-05-15` was key_id `32` in the live DB; task brief key_id `1175432` was absent.
- key_ids `4-15`, `16`, and `19` were revoked.
- key_id `31` (`Emart BFF Server 2026-05-15`) was preserved and live BFF smoke tests still returned 200.

Unexpected survivors remain for owner review:

- key_id `26`: `Next.js Frontend`, read_write, no recorded last access.
- key_ids `2` and `3`: 2023 WooCommerce Integration read_write keys, last access in March 2023.

Report: `workspace/audit/active/wc-key-rotation-20260523.md`
