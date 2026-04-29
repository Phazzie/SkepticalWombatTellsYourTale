# CLAUDE.md (src/components)

Extends `/CLAUDE.md`. Follow root rules first.

Scope: reusable React UI components shared across pages.

- Use `src/components/ui/primitives.tsx` for all layout and interactive elements.
  Do not reach for raw Tailwind color classes.
- Components are client-side only; no Prisma, NextAuth, or OpenAI imports.
- Keep props interfaces explicit and typed — no `any`, no prop-spreading unknown shapes.
- Stateful logic belongs in pages or custom hooks, not in leaf components.
- New subdirectories follow the existing pattern: `annotations/`, `auth/`, `layout/`,
  `project/`, `ui/`.
