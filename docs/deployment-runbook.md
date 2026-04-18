# Deployment Runbook

## Target strategy (current)

- **Hosting mode:** single-instance deployment with persistent disk (compatible with SQLite).
- **Database mode:** SQLite persisted on mounted storage for private-beta scale.
- **Scale trigger:** if horizontal scaling or zero-downtime multi-instance deploys are required, migrate Prisma datasource to managed Postgres before scaling out.

## Ownership and required environment variables

| Variable / secret | Scope | Owner | Purpose |
| --- | --- | --- | --- |
| `DATABASE_URL` | app runtime | Engineering | Prisma datasource location |
| `OPENAI_API_KEY` | app runtime | Engineering | AI analysis/transcription features |
| `NEXTAUTH_SECRET` | app runtime | Engineering/Security | Session/JWT signing |
| `NEXTAUTH_URL` | app runtime | Engineering | Canonical auth callback URL |
| `DEPLOY_STAGING_COMMAND` | GitHub Actions secret | Platform/DevOps | Staging deployment command |
| `STAGING_APP_URL` | GitHub Actions secret | Platform/DevOps | Smoke-test target for staging |
| `DEPLOY_PRODUCTION_COMMAND` | GitHub Actions secret | Platform/DevOps | Production deployment command |
| `PRODUCTION_APP_URL` | GitHub Actions secret | Platform/DevOps | Smoke-test target for production |

## CI/CD path

1. `CI` workflow enforces lint/build/unit tests and Prisma schema checks.
2. `Security` workflow enforces CodeQL and dependency audit.
3. `Release Readiness` workflow gates merges-to-main quality.
4. `Deploy` workflow:
   - auto-deploys **staging** after successful `Release Readiness` on `main`
   - allows manual **production** deploy (`workflow_dispatch`) with explicit confirmation
   - executes smoke checks after deploy

## Staging smoke-test scope

Smoke test script: `scripts/smoke-test.mjs`

Checks:
- `GET /` returns `200`
- `GET /sign-in` returns `200`
- `GET /register` returns `200`
- `GET /api/projects` returns `401` (auth boundary intact)

## Rollback drill (minimum)

1. Keep a known-good deployment artifact/revision ID.
2. Trigger rollback using your platform's rollback command (the inverse of deploy command).
3. Re-run smoke tests against rolled-back target.
4. Record incident + elapsed rollback time in `docs/STATUS.md`.
