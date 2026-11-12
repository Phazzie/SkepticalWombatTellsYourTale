# Origin CI

**Date:** 2026-11-12

Depot runs the GitHub Actions-syntax workflows in `.depot/workflows/` on `depot-ubuntu-24.04`. Those workflows start receiving pushes and pull requests once this repository is detached from GitHub and Origin is the source of truth. `.github/workflows/` stays in the tree until that cutover. GitHub Actions itself is not expected to run (account billing lock).

Locked installs use `npm ci`. Quality, audit, and the AI review job use Node 20 (`actions/setup-node` `20.x`). The previous Node 18 matrix is not ported.

## Workflow map

| GitHub workflow | Depot equivalent | What moved |
| --- | --- | --- |
| `.github/workflows/ci.yml` | `.depot/workflows/ci.yml` job `quality` | One Node 20 job: `npm ci`, `npx prisma validate`, `npx prisma format --check`, `npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script`, `npm run lint`, `npm run test:unit`, `npm run build`. Triggers: pull requests and pushes to `main`. |
| `.github/workflows/security.yml` job `dependency-audit` | `.depot/workflows/security.yml` job `dependency-audit` | `npm ci`, `npx prisma validate`, `npx prisma format --check`, `npm audit --audit-level=high` on Node 20. Triggers: pull requests, pushes to `main`, and Monday 06:00 UTC. |
| `.github/workflows/release-readiness.yml` | Folded into `.depot/workflows/ci.yml` `quality` | Prisma validate/format/diff, lint, and build already run on every pull request and on pushes to `main`. The echo-only `deploy-ready` job is not copied. |
| `.github/workflows/deploy.yml` | `.depot/workflows/deploy.yml` | Staging still posts the Vercel staging deploy hook, sleeps `DEPLOY_WAIT_SECONDS` (default 45), and runs `node scripts/smoke-test.mjs`. It now starts from a successful **CI** workflow run whose head branch is `main` (`workflow_run` workflow name `CI`). GitHub waited on the workflow named `Release Readiness`. Production stays manual: `workflow_dispatch` on `main` with input `target=production` and `confirm_production=deploy`. Manual staging dispatch (`target=staging`) is unchanged. |
| `.github/workflows/ci.yml` (no AI job) | `.depot/workflows/ci.yml` job `ai-review` | New. Pull requests only. Runs `node scripts/ai-review.mjs`. |

`actions/checkout@v4` and `actions/setup-node@v4` are the same actions the GitHub workflows already use. `runs-on` is `depot-ubuntu-24.04`.

## AI review

`scripts/ai-review.mjs` sends the pull request diff to the xAI chat API (`grok-4.5`) and posts one comment:

```bash
origin pr comment <PR_NUMBER> --body-file <file> --edit-last --create-if-none
```

The job passes `XAI_API_KEY` from Depot secrets and `PR_NUMBER` from `github.event.pull_request.number`. When `XAI_API_KEY` is unset, the script prints `AI review skipped: XAI_API_KEY is not set` and exits 0. When the pull request number is missing, or the `origin` CLI is not on `PATH`, it prints the review (if one was produced) and exits 0. A failed `origin pr comment` is also logged and does not fail the job. An xAI HTTP error after the key is set still fails the job.

## Secrets and variables to re-enter in Depot

Depot secrets are organization-scoped and are not copied by this change. Add them in Depot before the first real deploy or review run. `jobs.*.environment` is unsupported, so the GitHub environments `staging` and `production` are omitted. Their protection rules do not carry over. Production is still gated by the manual dispatch confirmation above.

| Name | Kind | Depot workflow | Required |
| --- | --- | --- | --- |
| `XAI_API_KEY` | secret | `ci.yml` `ai-review` | Optional. Missing key skips the review and leaves the job green. |
| `VERCEL_STAGING_DEPLOY_HOOK_URL` | secret | `deploy.yml` staging | Yes, before a staging deploy. |
| `STAGING_APP_URL` | secret | `deploy.yml` staging smoke test (`APP_URL`) | Yes, before a staging deploy. |
| `VERCEL_PRODUCTION_DEPLOY_HOOK_URL` | secret | `deploy.yml` production | Yes, before a production deploy. |
| `PRODUCTION_APP_URL` | secret | `deploy.yml` production smoke test (`APP_URL`) | Yes, before a production deploy. |
| `DEPLOY_WAIT_SECONDS` | variable | `deploy.yml` rollout sleep | Optional. Falls back to `45`. |

App runtime values (`DATABASE_URL`, `OPENAI_API_KEY`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`) stay on Vercel. CI uses a dummy `DATABASE_URL` only so Prisma can validate the schema. Do not put the production database URL into Depot for these workflows.

These GitHub settings are not read by the Depot workflows:

- `COPILOT_CODING_WORKFLOW_ID`
- `REVIEW_AUTOMATION_ALLOWED_BOTS` (default allowlist lives only in the GitHub review-comments workflow)

## GitHub-only pieces (not ported)

| Piece | Why it stops at detach |
| --- | --- |
| CodeQL (`github/codeql-action` init, autobuild, analyze) | Uploads results with `security-events: write` into GitHub code scanning. Origin has no CodeQL upload target. |
| Rosentic (`.github/workflows/rosentic.yml`, `Rosentic/rosentic-action@v1`) | GitHub App action that writes to GitHub pull requests. |
| Review comments automation (`.github/workflows/review-comments-automation.yml`) | `actions/github-script` files GitHub issues and dispatches the Copilot coding workflow (`COPILOT_CODING_WORKFLOW_ID`) or GitHub `repository_dispatch` events for other bots. Allowlisted bots are Copilot (`copilot-pull-request-reviewer[bot]`, `copilot-swe-agent[bot]`). |
| GitHub environments `staging` and `production` | Depot does not support `jobs.<job_id>.environment`. |
| Node 18 matrix entries | Depot quality and audit run on Node 20 only. |

## Local equivalents

```bash
npm ci
DATABASE_URL='postgresql://postgres:postgres@localhost:5432/skeptical_wombat?schema=public' npx prisma validate
DATABASE_URL='postgresql://postgres:postgres@localhost:5432/skeptical_wombat?schema=public' npx prisma format --check
DATABASE_URL='postgresql://postgres:postgres@localhost:5432/skeptical_wombat?schema=public' npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script > /tmp/prisma-schema.sql
npm run lint
npm run test:unit
npm run build
npm audit --audit-level=high
node scripts/ai-review.mjs
```

`node scripts/ai-review.mjs` with no `XAI_API_KEY` is the skip path and exits 0.
