# CLAUDE.md (src/app)

Extends `/CLAUDE.md`. Follow root rules first.

Scope: App Router pages, layouts, and route handlers.

- Keep `page.tsx` files focused; extract large sections into `src/components`.
- Use shared primitives from `src/components/ui/primitives.tsx` — not raw Tailwind colors.
- Preserve existing route paths and dynamic param names (`id`, `docId`, `gapId`, `tangentId`).
- List endpoints must eventually support pagination; document the missing limit/offset
  when adding new list routes and file a follow-up rather than silently returning unbounded data.
- Route handlers: use `handleRoute`, call `requireUser` + `ensureProjectAccess` for
  every project-scoped endpoint. Delegate business logic to services.
