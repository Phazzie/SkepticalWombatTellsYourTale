# CLAUDE.md (src/components)

Extends `/CLAUDE.md`. Follow root rules first.

Scope: reusable React UI components shared across pages.

- Prefer `src/components/ui/primitives.tsx` for layout and interactive elements in new code.
  Existing components still use raw Tailwind color utilities — refactoring is a separate effort.
- Avoid direct Prisma and OpenAI imports in components. `next-auth/react` client hooks
  are acceptable (e.g., `auth-forms.tsx` uses `signIn`); server-only NextAuth imports are not.
- Keep props interfaces explicit and typed — no `any`, no prop-spreading unknown shapes.
- Stateful logic belongs in pages or custom hooks, not in leaf components.
- New subdirectories follow the existing pattern: `annotations/`, `auth/`, `layout/`,
  `project/`, `ui/`.
