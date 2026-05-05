# CLAUDE.md (src/lib/ai)

Extends `/CLAUDE.md`. Follow root rules first.

Scope: AI integration — prompt construction, OpenAI calls, retry logic, response parsing.

- All user-supplied content (transcripts, document text) must be passed through
  `sanitizeForPrompt()` before inclusion in any prompt. Never interpolate raw user strings.
- User content belongs in the `user` / `content` role only — never in the `system` role.
  Violating this enables prompt injection.
- Validate non-empty content and length bounds (≤ 40 000 chars for transcripts,
  ≤ 30 000 chars for documents) at the call site before invoking OpenAI.
- Always handle invalid or partial AI responses with safe fallbacks — never let a
  malformed JSON response from the model propagate as an unhandled exception.
- Degrade gracefully when `OPENAI_API_KEY` is missing; return a structured error, do not
  crash the request.
- The retry utility (`src/lib/ai/retry.ts`) already handles transient failures with
  exponential backoff and AbortSignal. Use it; do not roll a custom retry loop.
