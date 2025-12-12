# expo-storage-migrate

You are improving or migrating AsyncStorage usage in this app.

Goals:
- Version keys when changing stored shapes (e.g. @salat_tracker_v2).
- Ensure safe parsing (try/catch) and shape validation.
- Avoid excessive writes (batch updates when needed).
- Keep backward compatibility if existing users have data.

Rules:
- Storage logic should live in `lib/` (or `contexts/` for context-specific).
- Do not store secrets/tokens.
- Do not modify .env files or config files unless explicitly requested.

Deliver:
1) Proposed storage schema and migration approach
2) Files to change
3) Final code (copy-paste ready)
4) Manual test plan (fresh install + existing data)
