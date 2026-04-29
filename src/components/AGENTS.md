# AGENTS.md (src/components)

This file extends `/AGENTS.md` and `/src/app/AGENTS.md`.

Scope: reusable React UI components.

- Use primitives from `src/components/ui/primitives.tsx` as the base design system.
  Never use raw Tailwind color utility classes; derive all styles from the primitives.
- Keep components pure and stateless where possible; lift state to pages.
- Extract large page sections into components in the relevant subdirectory
  (`annotations/`, `auth/`, `layout/`, `project/`, `ui/`).
- No server-side logic (Prisma, auth, OpenAI) inside components — components receive
  data via props or client-side fetch only.
- Component filenames: `PascalCase.tsx`. Exported component name must match the filename.
