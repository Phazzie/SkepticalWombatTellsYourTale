# AGENTS.md (src/app/api)

This file extends `/AGENTS.md` and `/src/app/AGENTS.md`.

- All routes must use `handleRoute` and return `{ error: string }` on failures.
- Enforce `requireUser` and `ensureProjectAccess` for protected resources.
- Prefer schema-based validation when parsing request bodies.
- Keep route handlers thin; delegate to services/repositories.
- Preserve request/response shapes unless updating all callers.
