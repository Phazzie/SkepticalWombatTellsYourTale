# CLAUDE.md (src/lib/server)

Extends `/CLAUDE.md`. Follow root rules first.

Scope: server-side services, repositories, adapters, error helpers, auth, rate limiting.

- The preferred layering is: route handler → service → port interface → adapter → Prisma/OpenAI.
  Many existing services (projects, documents, sessions, export) call repositories directly —
  that is acceptable for CRUD-only services. Use ports/adapters for AI-dependent services.
- `enforceRateLimit` is in-memory and process-local. In multi-instance/serverless
  deployments each cold start has an empty bucket map — this is a known limitation.
  Do not remove it; do not treat it as a hard distributed guarantee.
- For project-scoped route handlers under `src/app/api/projects/[id]/**`, use
  `requireProjectHandler(params)` from `src/lib/server/route-guard.ts` — it bundles
  auth and membership checks in one call. `requireUser` + `requireProjectAccess` inline
  is the older pattern; prefer `requireProjectHandler` for new routes.
- New AI-dependent services should follow `analysis.service.ts` as the model:
  parameter-based dependency injection via a `deps` object with optional overrides,
  single responsibility, no direct Prisma access (go through the port).
- `resetRateLimitForTests()` is a test helper exported from `rate-limit.ts`. Do not call
  it in application code; use it only in `__tests__/` fixtures.
