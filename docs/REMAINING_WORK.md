# Remaining Work and Known Issues

This document tracks remaining deployment tasks, known issues, and open items for the SkepticalWombatTellsYourTale project.

## Deployment Checklist

### External actions required (outside repo)

- [ ] Provision managed Postgres instance and set `DATABASE_URL` in Vercel.
- [ ] Configure all required Vercel project environment variables:
  - `DATABASE_URL`
  - `OPENAI_API_KEY`
  - `NEXTAUTH_SECRET`
  - `NEXTAUTH_URL`
- [ ] Create Vercel deploy hooks and set GitHub secrets:
  - `VERCEL_STAGING_DEPLOY_HOOK_URL`
  - `VERCEL_PRODUCTION_DEPLOY_HOOK_URL`
  - `STAGING_APP_URL`
  - `PRODUCTION_APP_URL`
- [ ] Execute first staging deploy + smoke + rollback drill.
- [ ] Run `npm run db:migrate:deploy` on first production deployment before starting the server.

## OpenAI API Key Behavior Reference

The following documents the exact HTTP behavior for each endpoint when `OPENAI_API_KEY` is missing:

| Endpoint | Behavior when `OPENAI_API_KEY` is unset |
| --- | --- |
| `POST /api/projects/[id]/analyze` | Returns **400** (`badRequest(...)` via `handleRoute`) — fails fast with an explicit error |
| `POST /api/projects/[id]/questions` (generate) | Returns **400** (`badRequest(...)` via `handleRoute`) — fails fast with an explicit error |
| `POST /api/projects/[id]/voice-draft` | Returns **400** (`badRequest(...)` via `handleRoute`) — fails fast with an explicit error |
| `POST /api/transcribe` | Transcription error is caught; a fallback transcript is stored and session creation continues |
| `GET/PATCH /api/projects/[id]/concepts` | **Not affected** — does not call OpenAI; reads/updates stored data only |
| `GET/PATCH /api/projects/[id]/contradictions` | **Not affected** — does not call OpenAI; reads/updates stored data only |

**Notes:**
- AI endpoints that call OpenAI return **400** (not 500) when the key is missing. This is an intentional "fail fast" design using `badRequest(...)` routed through `handleRoute`.
- `/concepts` and `/contradictions` are pure data routes and are not blocked by a missing `OPENAI_API_KEY`.
- Set `OPENAI_API_KEY` in production before enabling the analyze, questions generation, and voice-draft features.

## Smoke Test: AI Endpoint Verification

When running smoke tests with `OPENAI_API_KEY` unset, the expected behavior is:

- `POST /api/projects/[id]/analyze` — returns **400** (expected fail-fast)
- `POST /api/projects/[id]/questions` — returns **400** (expected fail-fast)
- `POST /api/projects/[id]/voice-draft` — returns **400** (expected fail-fast)
- `GET /api/projects/[id]/concepts` — returns **200** (not key-dependent)
- `GET /api/projects/[id]/contradictions` — returns **200** (not key-dependent)

## Open Issues

| Issue | Title | Status | Recommendation |
| --- | --- | --- | --- |
| #82 | Add request correlation IDs to logger and API middleware | Open | Medium priority; enhances observability |
| #81 | Add Sentry error monitoring for production observability | Open | Medium priority; post-launch follow-up |
| #67 | Empty states and onboarding for new users and new projects | Open | UX improvement; post-launch |
| #66 | Session detail page: full transcript + all AI annotations | Open | UX improvement; post-launch |
| #65 | Improve export: differentiate levels and include questions/concepts/contradictions | Open | Feature enhancement; post-launch |
| #64 | Add project rename and delete UI | Open | UX improvement; post-launch |
| #63 | Add action buttons to insight detail pages | Open | UX improvement; post-launch |
| #62 | Migrate documents & questions pages to app design system | Open | UX improvement; post-launch |
