# AGENTS.md (src/lib/ai)

This file extends `/AGENTS.md` and `/src/lib/AGENTS.md`.

- Keep prompt logic and parsing isolated and well‑guarded.
- Always handle invalid/partial AI responses with safe fallbacks.
- Ensure graceful degradation when `OPENAI_API_KEY` is missing.
- Avoid logging sensitive user content.
