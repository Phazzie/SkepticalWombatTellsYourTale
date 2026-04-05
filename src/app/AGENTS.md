# AGENTS.md (src/app)

This file extends `/AGENTS.md`. Follow root rules first.

Scope: App Router UI pages, layouts, and route handlers in `src/app`.

UI guidance
- Keep `page.tsx` files focused; extract large sections into components under `src/components`.
- Prefer shared primitives from `src/components/ui/primitives.tsx`.
- Keep client components minimal and isolate stateful logic.
- Preserve existing route paths and dynamic param names.

Route handler guidance
- Use `handleRoute` for consistent error handling.
- Require auth with `requireUser` and `ensureProjectAccess` as appropriate.
- Validate inputs via schema/validation helpers.
- Avoid direct Prisma access in route handlers; use services/repositories.
