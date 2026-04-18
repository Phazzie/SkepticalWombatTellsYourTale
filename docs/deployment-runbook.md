# Deployment Runbook

## Target strategy (current)

- **Hosting mode:** Vercel (staging + production).
- **Database mode:** managed PostgreSQL (recommended: Vercel Postgres/Neon/Supabase).
- **Scaling posture:** managed Postgres supports concurrent serverless instances and avoids filesystem-persistence issues on Vercel.

## Ownership and required environment variables

| Variable / secret | Scope | Owner | Purpose |
| --- | --- | --- | --- |
| `DATABASE_URL` | app runtime | Engineering | Prisma datasource location |
| `OPENAI_API_KEY` | app runtime | Engineering | AI analysis/transcription features |
| `NEXTAUTH_SECRET` | app runtime | Engineering/Security | Session/JWT signing |
| `NEXTAUTH_URL` | app runtime | Engineering | Canonical auth callback URL |
| `VERCEL_STAGING_DEPLOY_HOOK_URL` | GitHub Actions secret | Platform/DevOps | Vercel staging deploy hook |
| `STAGING_APP_URL` | GitHub Actions secret | Platform/DevOps | Smoke-test target for staging |
| `VERCEL_PRODUCTION_DEPLOY_HOOK_URL` | GitHub Actions secret | Platform/DevOps | Vercel production deploy hook |
| `PRODUCTION_APP_URL` | GitHub Actions secret | Platform/DevOps | Smoke-test target for production |

## CI/CD path

1. `CI` workflow enforces lint/build/unit tests and Prisma schema checks.
2. `Security` workflow enforces CodeQL and dependency audit.
3. `Release Readiness` workflow gates merges-to-main quality.
4. `Deploy` workflow:
   - auto-deploys **staging** after successful `Release Readiness` on `main`
   - allows manual **production** deploy (`workflow_dispatch`) with explicit confirmation
   - waits for rollout using `DEPLOY_WAIT_SECONDS` repository variable (default `45`)
   - executes smoke checks after deploy
   - note: rollout waiting is currently time-based (fixed sleep), so tune `DEPLOY_WAIT_SECONDS` to your platform behavior; add deployment-status polling as a follow-up hardening step

## Staging smoke-test scope

Smoke test script: `scripts/smoke-test.mjs`

Checks:
- `GET /` returns `200`
- `GET /sign-in` returns `200`
- `GET /register` returns `200`
- `GET /api/projects` returns `401` (auth boundary intact)

## Rollback drill (minimum)

1. Keep a known-good deployment artifact/revision ID.
2. Trigger rollback from Vercel Deployments UI (promote previous good deployment) or Vercel CLI.
3. Re-run smoke tests against rolled-back target.
4. Record incident + elapsed rollback time in `docs/STATUS.md`.
