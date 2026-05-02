# CLAUDE.md — SkepticalWombat Tells Your Tale

This is the Claude Code instruction file. It mirrors and extends AGENTS.md.
Read `/AGENTS.md` first — this file adds Claude-specific context.

## Project

Voice-first memoir writing tool. Users speak; the AI transcribes, analyzes, detects
contradictions and dropped threads, and builds persistent cross-session memory.

Stack: Next.js 15.5 (App Router) · TypeScript strict · Prisma + SQLite ·
NextAuth v4 · OpenAI Whisper + GPT-4o · Tailwind CSS.

## Setup

```bash
npm install
npx prisma generate
npx prisma migrate dev        # first time only
npm run dev                   # http://localhost:3000
```

## Key Commands

| Command | What it does |
|---------|-------------|
| `npm run lint` | ESLint — must pass |
| `npm run build` | Next.js production build — must pass |
| `npm run test:unit` | Unit tests (node:test + tsx) — must pass |
| `npx prisma validate` | Validate schema — must pass |
| `npm test` | **Alias for lint+build only — NOT unit tests** |

Run all four checks before every commit.

## Architecture

```text
route handler (src/app/api/)
  └─ handleRoute + requireProjectHandler (project routes) / requireUser (other)
       └─ service (src/lib/server/services/)
            └─ port interface (src/lib/server/ports/) [AI-dependent services]
                 └─ adapter (src/lib/server/adapters/)
                      └─ Prisma / OpenAI
```

## Design System

Use primitives from `src/components/ui/primitives.tsx`:
`Shell`, `Container`, `Card`, `GlassCard`, `PrimaryButton`, `SecondaryButton`,
`TextInput`, `TextArea`, `AppBackLink`, `StatusMessage`, `WombatMark`.

Prefer primitives over raw Tailwind color utility classes (`bg-gray-950`, `text-zinc-900`, etc.)
in new code. Existing pages and components still use raw colors — refactoring is a tracked
follow-up, not a blocker.

## Critical Known Risks

- **Rate limiter is process-local**: `enforceRateLimit` in `src/lib/server/rate-limit.ts`
  resets on each serverless cold start. Do not remove it; it still defends against
  single-instance abuse and is a meaningful safeguard in dev/staging.
- **`npm test` ≠ unit tests**: `npm test` runs lint+build only. Use `npm run test:unit`
  for behavioral validation.
- **`prisma db push` in bootstrap**: `npm run db:bootstrap` calls `prisma db push`.
  Never run this against a production `DATABASE_URL` — it bypasses migration history.
- **Prompt injection surface**: user transcripts go to OpenAI verbatim (via `sanitizeForPrompt`).
  Validate length and content at the route boundary; never put user strings in the
  system prompt role.
- **`x-forwarded-for` not proxy-validated**: registration rate-limiting reads the
  forwarded IP without confirming the proxy source. Be aware when deploying behind
  untrusted proxies.

## Periodic Review Checklist

Before any PR:
- [ ] `npm run lint` passes
- [ ] `npm run build` passes
- [ ] `npm run test:unit` passes
- [ ] `npx prisma validate` passes
- [ ] No secrets committed
- [ ] All new routes call `requireUser` and appropriate access checks
- [ ] No raw user input forwarded to OpenAI without bounds-checking
- [ ] API shapes backward-compatible (or all callers updated in same commit)
- [ ] No `prisma db push` used outside local dev bootstrap

## Do / Don't

### Do
- Use `handleRoute` for every API route
- Use `requireProjectHandler(params)` for all routes under `/api/projects/[id]/**`
- Call `requireUser` directly for routes outside that subtree
- Use `badRequest` / `notFound` / `unauthorized` from `src/lib/server/errors.ts`
- Validate inputs at route boundaries (type, presence, length)
- Add unit tests for new service functions
- Use `npm run test:unit` to verify behavioral correctness

### Don't
- Don't use `prisma db push` (use `prisma migrate dev` for dev, `prisma migrate deploy` for prod)
- Don't skip `npm run test:unit` — `npm test` does NOT run unit tests
- Don't add `any` types without justification
- Don't add npm packages without necessity
- Don't put user content in system prompt roles
- Don't expose stack traces in error responses
- Don't commit `.env` or secrets
