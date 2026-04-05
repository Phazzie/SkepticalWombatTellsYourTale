# AGENTS.md (src/lib/server)

This file extends `/AGENTS.md` and `/src/lib/AGENTS.md`.

- Maintain the route → service → repository layering.
- Use `AppError` helpers and `handleRoute` for consistent error responses.
- Use mappers for JSON-string fields (`aiAnnotations`, `sessionRefs`).
- Ensure AI-heavy endpoints are rate-limited and authenticated.
- Keep services injectable for testing.
