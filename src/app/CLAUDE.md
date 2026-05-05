# CLAUDE.md (src/app)

Extends `/CLAUDE.md`. Follow root rules first.

Scope: App Router pages, layouts, and route handlers.

- Keep `page.tsx` files focused; extract large sections into `src/components`.
- Prefer primitives from `src/components/ui/primitives.tsx` over raw Tailwind color utilities
  in new code. Existing pages still use raw colors — refactoring is a separate effort.
- Preserve existing route paths and dynamic param names (`id`, `docId`, `gapId`, `tangentId`).
- List endpoints must eventually support pagination; document the missing limit/offset
  when adding new list routes and file a follow-up rather than silently returning unbounded data.
- Route handlers: use `handleRoute`. For project-scoped routes under `/api/projects/[id]/**`,
  use `requireProjectHandler(params)` from `src/lib/server/route-guard.ts`. Delegate
  business logic to services.
