# CLAUDE.md (src/lib)

Extends `/CLAUDE.md`. Follow root rules first.

Scope: shared libraries, types, and utilities used by both app and server code.

- Shared frontend/backend types live in `src/lib/types.ts` — do not duplicate them.
- `src/lib/server/` is server-only; never import it from client components or pages.
- `src/lib/client/` is client-safe; keep it free of Node.js or Prisma imports.
- Avoid circular dependencies; use ports/adapters interfaces for any side effects.
- Preserve `null` vs `undefined` semantics that match Prisma model shapes.
