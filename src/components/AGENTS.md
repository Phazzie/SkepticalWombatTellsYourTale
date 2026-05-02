# AGENTS.md (src/components)

This file extends `/AGENTS.md` and `/src/app/AGENTS.md`.

Scope: reusable React UI components.

- Prefer primitives from `src/components/ui/primitives.tsx` for new code.
  Existing components (including `project/dashboard/*`) still use raw Tailwind color
  utilities — follow the existing file's pattern when editing it; use primitives for
  genuinely new components.
- Keep components pure and stateless where possible; lift state to pages.
- Extract large page sections into components in the relevant subdirectory
  (`annotations/`, `auth/`, `layout/`, `project/`, `ui/`).
- No server-side logic (Prisma, auth, OpenAI) inside components — components receive
  data via props or client-side fetch only.
- Component filenames: `kebab-case.tsx` (e.g., `dashboard-action-cards.tsx`). This matches
  all existing files. The exported component name uses `PascalCase` regardless.
