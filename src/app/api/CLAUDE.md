# CLAUDE.md (src/app/api)

Extends `/CLAUDE.md`. Follow root rules first.

Scope: Next.js API route handlers.

- Every handler must be wrapped in `handleRoute`; return `{ error: string }` on failure
  with the correct HTTP status (400/401/403/404/429/500).
- For routes under `src/app/api/projects/[id]/**`, use `requireProjectHandler(params)`
  from `src/lib/server/route-guard.ts` — it bundles auth + project membership in one call.
  For routes outside that subtree (e.g., `/api/transcribe`), call `requireUser` directly.
- Validate all request body fields before use: required presence, correct type, non-empty
  strings, and reasonable length limits (transcripts ≤ 40 000 chars per `AI_TOKEN_BUDGETS.transcriptMaxChars`,
  audio ≤ 15 MB).
- Use `parseJsonBody()` for JSON bodies. Do not use raw `.json().catch()`.
- Rate limiting (`enforceRateLimit`) is in-memory and process-local. It provides
  best-effort single-instance defense only; do not remove it, but do not treat it as a
  hard distributed limit.
- Never expose stack traces or internal file paths in error responses.
