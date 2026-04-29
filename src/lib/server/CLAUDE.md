# CLAUDE.md (src/lib/server)

Extends `/CLAUDE.md`. Follow root rules first.

Scope: server-side services, repositories, adapters, error helpers, auth, rate limiting.

- Maintain the layering: route handler → service → port interface → adapter → Prisma/OpenAI.
  Do not skip layers.
- `enforceRateLimit` is in-memory and process-local. In multi-instance/serverless
  deployments each cold start has an empty bucket map — this is a known limitation.
  Do not remove it; do not treat it as a hard distributed guarantee.
- `ensureProjectAccess` (in `auth.ts`) is the canonical project auth check. Prefer it
  over ad-hoc inline checks. Note: it currently over-fetches; when adding new auth checks
  prefer selecting only the fields you need.
- New services should follow `analysis.service.ts` as the model: constructor injection,
  single responsibility, no direct Prisma access (go through the port).
- `resetRateLimitForTests()` is a test helper exported from `rate-limit.ts`. Do not call
  it in application code; use it only in `__tests__/` fixtures.
