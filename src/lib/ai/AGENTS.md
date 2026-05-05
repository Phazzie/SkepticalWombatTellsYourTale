# AGENTS.md (src/lib/ai)

This file extends `/AGENTS.md` and `/src/lib/AGENTS.md`.

- Keep prompt logic and parsing isolated and well-guarded.
- Always handle invalid/partial AI responses with safe fallbacks.
- Ensure graceful degradation when `OPENAI_API_KEY` is missing.
- Avoid logging sensitive user content.
- Pass all user-supplied content through `sanitizeForPrompt()` before including it in a
  prompt. Never interpolate raw user strings directly.
- User content (transcripts, documents) belongs in the `user`/`content` role only.
  Never place user content in the `system` role — this prevents prompt injection.
- Validate non-empty content and enforce length bounds (≤ 40 000 chars for transcripts,
  ≤ 30 000 for documents) at the call site before invoking OpenAI.
- Use the existing retry utility in `src/lib/ai/retry.ts` for transient failures.
  Do not write a custom retry loop.
