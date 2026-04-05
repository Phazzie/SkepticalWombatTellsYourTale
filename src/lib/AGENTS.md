# AGENTS.md (src/lib)

This file extends `/AGENTS.md`.

Scope: shared libraries, types, and utilities.

- Keep shared types in `src/lib/types.ts` and avoid ad-hoc duplication.
- Keep API contracts consistent with routes.
- Avoid circular dependencies; prefer ports/adapters for side effects.
- Preserve null vs undefined semantics used by Prisma models.
