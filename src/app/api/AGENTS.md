# AGENTS.md (src/app/api)

This file extends `/AGENTS.md` and `/src/app/AGENTS.md`.

- All routes must use `handleRoute` and return `{ error: string }` on failures.
- For routes under `src/app/api/projects/[id]/**`, use `requireProjectHandler(params)`
  from `src/lib/server/route-guard.ts` (bundles auth + project membership). For other
  protected routes (e.g., `/api/transcribe`), call `requireUser` directly.
- Validate all request body fields: presence, type, non-empty strings, and length limits.
  Transcripts ≤ 40 000 chars (see `AI_TOKEN_BUDGETS.transcriptMaxChars` in `src/lib/ai/config.ts`);
  audio files ≤ 15 MB. Use `badRequest` for violations.
- Use `parseJsonBody()` for JSON bodies — do not use raw `.json().catch()`.
- Keep route handlers thin; delegate to services/repositories.
- Preserve request/response shapes unless updating all callers.
- `enforceRateLimit` is in-memory and process-local; it resets on cold starts.
  It provides best-effort single-instance defense. Do not remove it.
