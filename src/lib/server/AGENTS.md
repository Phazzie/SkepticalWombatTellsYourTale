# AGENTS.md (src/lib/server)

This file extends `/AGENTS.md` and `/src/lib/AGENTS.md`.

- Maintain the route → service → repository layering.
- Use `AppError` helpers and `handleRoute` for consistent error responses.
- Use mappers for JSON-string fields (`aiAnnotations`, `sessionRefs`).
- Ensure AI-heavy endpoints are rate-limited and authenticated.
- Keep services injectable for testing; follow `analysis.service.ts` as the model pattern.
- `enforceRateLimit` is in-memory and process-local. Known limitation: in serverless
  deployments each cold start begins with empty buckets. Do not remove it; do not treat
  it as a hard distributed guarantee. Use a shared store (e.g., Redis) for hard limits.
- `resetRateLimitForTests()` is a test-only export from `rate-limit.ts`. Do not call it
  in application code.
- `ensureProjectAccess` is the canonical project auth check; prefer it over ad-hoc inline
  checks. It currently fetches all project fields — when performance matters, consider
  selecting only `id`, `userId`, and `members.userId`.
