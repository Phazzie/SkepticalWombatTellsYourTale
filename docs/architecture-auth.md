# Architecture + Auth + UI Brief

## Product Direction

- Tone: serious, warm, focused writing studio
- Visual personality: clean dark UI, clear hierarchy, subtle micro-interactions
- Pizzazz constraints: lightweight motion only, no distracting effects
- Accessibility baseline: visible focus, keyboard-first interactions, reduced-motion support
- Performance budget: no heavy animation/runtime dependencies

## Auth & Business Rules

- Auth: NextAuth credentials provider with Prisma adapter
- Scope: projects are private by default
- Authorization: owner + explicit members can view/edit
- Deletion: owner only
- Future collaboration: `ProjectMember` supports role expansion

## Backend Structure

Route handlers delegate to server-layer modules:

- `src/lib/server/auth.ts` for auth/authz guards
- `src/lib/server/validation.ts` for payload validation
- `src/lib/server/errors.ts` + `http.ts` for centralized error contracts
- `src/lib/server/repositories/*` for data access
- `src/lib/server/services/*` for domain orchestration

This keeps responsibilities separated and avoids duplicated request logic.

## KISS / DRY / SOLID Alignment

- Shared primitives and states prevent per-page UI duplication
- Shared route wrapper and validation utilities prevent repeated API boilerplate
- Repository/service split keeps responsibilities focused and testable
- External providers remain encapsulated through focused modules
