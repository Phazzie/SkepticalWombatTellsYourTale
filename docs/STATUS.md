# Project Status

**Date:** 2026-04-07  
**Target readiness:** Private beta  
**Execution mode:** Autonomous run completing roadmap phases 1–5

## Executive summary
- Core product surface is implemented (auth, projects, record, sessions, documents, questions, export, insights, search).
- This run completed phases 1–5 as a release-readiness pass by:
  - locking detailed acceptance criteria,
  - hardening JSON request handling and export payload validation,
  - documenting/validating AI fallback behavior,
  - confirming data-evolution and schema-check readiness,
  - expanding targeted tests and rerunning full validation.
- Remaining release work is now primarily in phases 6+ (CI run-history stability, security/risk gates, launch ops).

## Update — 2026-04-09 (Phase 6/7 hardening pass)
- Hardened `POST /api/projects/[id]/questions` to reject malformed JSON with deterministic `400` (no fallback generation on parse failure).
- Hardened `POST /api/transcribe` with strict upload guardrails before heavy processing:
  - MIME allowlist enforcement,
  - explicit file-size bounds,
  - early malformed upload rejection.
- Strengthened `POST /api/auth/register` abuse resistance and privacy posture:
  - IP normalization for rate-limit keying,
  - preserved strict request-shape validation with centralized JSON parsing,
  - reduced duplicate-account enumeration detail in error message.
- Improved auth reliability by safely converting session-resolution runtime errors into `401 Unauthorized` at auth guard boundary.
- Added direct route-handler contract tests for high-risk endpoints:
  - `auth/register`, `projects/[id]/questions`, `transcribe`, `projects/[id]/sessions`, `projects/[id]/documents`, `projects/[id]/export`.
- Updated workflow consistency for Prisma checks:
  - moved Prisma checks earlier in `release-readiness.yml`,
  - added Prisma validate/format checks to `security.yml` dependency-audit job.

## Update — 2026-04-18 (CI audit + deployability implementation)
- Completed run-history audit using GitHub Actions runs/logs for latest 10 runs:
  - `ci.yml`: 0/10 successful (failure cause: `npm run test:unit` glob path resolution in CI shell)
  - `security.yml`: 2/10 successful (failure cause: `npm audit --audit-level=high` reporting a high advisory on `next@15.5.14`)
  - `release-readiness.yml`: 10/10 successful
- Implemented CI/security remediations:
  - replaced brittle unit test glob invocation with deterministic script runner (`scripts/run-unit-tests.mjs`)
  - updated `next` and `eslint-config-next` to `15.5.15` to clear current high advisory signal
  - updated `npm test` to run verify + unit tests so local and CI expectations are aligned
- Added deployment readiness artifacts:
  - new deploy automation workflow: `.github/workflows/deploy.yml`
  - post-deploy smoke suite: `scripts/smoke-test.mjs`
  - deployment/env ownership runbook: `docs/deployment-runbook.md`
  - expanded `.env.example` with `NEXTAUTH_SECRET` and `NEXTAUTH_URL`

### Phase verdicts (current)
| Phase | Verdict | Notes |
| --- | --- | --- |
| Phase 6 — CI health and quality gates | **Conditional** | Local gates pass; workflow-run trend evidence is required for sustained-pass confirmation. |
| Phase 7 — Security, privacy, risk register | **Pass (with monitoring follow-up)** | Identified route/API hardening blockers were remediated; continue CI security monitoring and risk-register upkeep. |

### Workflow-run evidence snapshot (GitHub Actions)
- Latest 10 runs at 2026-04-18 audit time:
  - `ci.yml`: 0/10 successful (all failing at unit-test command resolution)
  - `release-readiness.yml`: 10/10 successful
  - `security.yml`: 2/10 successful (dependency-audit failing due to Next.js advisory)
- Remediation committed in this branch:
  - `test:unit` execution path hardened for CI shell behavior
  - Next.js patch-level upgrade applied to address audit failure root cause

## Readiness rubric

| Area | Status | Notes |
| --- | --- | --- |
| Auth & authorization | 🟢 | `requireUser` + project access checks enforced across project routes. |
| Core data flows | 🟢 | Projects/documents/sessions/export implemented; payload handling hardened in this run. |
| AI workflows | 🟢 | Explicit no-key behavior validated for analyze/questions/voice-draft/transcribe fallback. |
| UI completeness | 🟢 | Core pages + dedicated insight pages are present. |
| Observability & error handling | 🟢 | `handleRoute` correlation/error envelope in place; invalid JSON now normalized to 400 on key routes. |
| Data integrity readiness | 🟢 | Prisma schema check workflow and local command set documented and validated in runbook. |
| Testing readiness (phases 1–5 scope) | 🟢 | Lint/build/unit tests passing; validation helper coverage expanded. |
| CI health (phase 6+) | 🟡 | Workflows exist; sustained pass-rate audit remains a post-phase-5 gate. |

---

## Phase 1 — Acceptance criteria lock (completed)

### North-star flow acceptance criteria (pass/fail)

| Flow | Acceptance criterion |
| --- | --- |
| Register/sign-in/sign-out | User can register and authenticate; protected project endpoints require auth. |
| Project lifecycle | User can list/create/view/update/delete own project; cross-user access denied. |
| Record/analyze | Session transcription path works; analysis route accepts validated payload and persists output. |
| Sessions playback | Sessions list renders transcript and parsed annotations payload. |
| Documents workflow | User can create/edit/delete documents; voice-draft endpoint available from documents flow. |
| Questions workflow | User can list/generate/update question status; invalid updates return 400. |
| Insight workflows | Gaps/tangents/concepts/contradictions updates persist and return expected statuses/errors. |
| Search | Query validation enforced; blank query returns empty response; results are grouped entities. |
| Export | Export route returns markdown attachment across levels (`raw|structured|polished|full`). |
| AI degraded mode | Analyze/questions/voice-draft return explicit 400 when key missing; transcribe stores fallback transcript. |

### Evidence pointers
- API routes: `src/app/api/**/route.ts`
- Services: `src/lib/server/services/*.ts`
- Contracts/tests: `src/app/api/__tests__/*.test.ts`, `src/lib/server/services/__tests__/*.test.ts`

---

## Phase 2 — API contract hardening (completed)

### Changes implemented in this run
- Added `parseJsonBody` helper to standardize invalid JSON handling as `AppError(400)`:
  - `src/lib/server/validation.ts`
- Applied helper to key API routes that previously allowed raw JSON parse exceptions:
  - `src/app/api/auth/register/route.ts`
  - `src/app/api/projects/route.ts`
  - `src/app/api/projects/[id]/analyze/route.ts`
  - `src/app/api/projects/[id]/voice-draft/route.ts`
  - `src/app/api/projects/[id]/documents/route.ts`
  - `src/app/api/projects/[id]/documents/[docId]/route.ts`
  - `src/app/api/projects/[id]/sessions/route.ts`
  - `src/app/api/projects/[id]/gaps/[gapId]/route.ts`
  - `src/app/api/projects/[id]/tangents/[tangentId]/route.ts`
  - `src/app/api/projects/[id]/concepts/route.ts`
  - `src/app/api/projects/[id]/contradictions/route.ts`
  - `src/app/api/projects/[id]/export/route.ts`
- Hardened export payload contract:
  - `level` is validated against `raw|structured|polished|full`
  - boolean flags are normalized explicitly (`=== true`)
  - invalid `level` now returns 400 with standard error envelope

### Contract outcome
- Invalid/malformed JSON now deterministically maps to 400 on hardened routes instead of leaking parser exceptions into 500 responses.

---

## Phase 3 — AI reliability and degraded-mode behavior (completed)

### Endpoint behavior matrix (no `OPENAI_API_KEY`)

| Endpoint/workflow | Behavior |
| --- | --- |
| `POST /api/projects/[id]/analyze` | 400: `AI analysis unavailable: configure OPENAI_API_KEY` |
| `POST /api/projects/[id]/questions` (generate) | 400: `Question generation unavailable: configure OPENAI_API_KEY` |
| `POST /api/projects/[id]/voice-draft` | 400: `Voice draft unavailable: configure OPENAI_API_KEY` |
| `POST /api/transcribe` | Transcription errors are caught; fallback transcript is stored and session creation continues |

### Evidence pointers
- `src/lib/server/services/analysis.service.ts`
- `src/lib/server/services/questions.service.ts`
- `src/lib/server/services/voice-draft.service.ts`
- `src/lib/server/services/transcription.service.ts`
- Related tests in `src/lib/server/services/__tests__/*.test.ts`

---

## Phase 4 — Data integrity and migration readiness (completed)

### Guardrails in place
- Prisma schema checks are defined in CI (`.github/workflows/ci.yml`):
  - `npx prisma validate`
  - `npx prisma format --check`
  - schema diff generation command
- Local schema evolution guardrails documented:
  - `docs/migrations-and-data-evolution.md`
- JSON-string persistence fields remain mapper-driven:
  - `src/lib/server/mappers/ai-annotations.ts`
  - `src/lib/server/mappers/session-refs.ts`

### Required release-gate commands (schema/data)
- `DATABASE_URL='file:./dev.db' npx prisma validate`
- `DATABASE_URL='file:./dev.db' npx prisma format --check`
- `DATABASE_URL='file:./dev.db' npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script > /tmp/prisma-schema.sql`

---

## Phase 5 — Testing completion for phases 1–5 scope (completed)

### Added/updated test coverage in this run
- Added validation coverage for JSON body parsing helper:
  - `src/lib/server/__tests__/validation.test.ts` (`parseJsonBody` success + 400 failure path)

### Full validation run status
- ✅ `npm run lint`
- ✅ `npm run build`
- ✅ `npm run test:unit`

---

## Vision-to-implementation matrix (beta scope)

| Feature (from README) | Backend / API | UI | Status |
| --- | --- | --- | --- |
| Voice-first input | `/api/transcribe`, `/api/projects/[id]/analyze` | `/project/[id]/record` | ✅ |
| Project-aware AI partner | analysis service + AI port | record flow surfaces analysis outputs | ✅ |
| Living document structure | documents CRUD routes | `/project/[id]/documents` | ✅ |
| Tangent tracker | analysis persistence + tangent mutation route | `/project/[id]/tangents` | ✅ |
| Gap detection | analysis persistence + gap mutation route | `/project/[id]/gaps` | ✅ |
| Question generation | questions service + route | `/project/[id]/questions` | ✅ |
| Pattern recognition | analysis persistence | `/project/[id]/patterns` | ✅ |
| Contradiction flagging | contradictions route | `/project/[id]/contradictions` | ✅ |
| Voice preservation mode | voice-draft route | documents page integration | ✅ |
| “Say what you suspect” | analysis significance output | record flow | ✅ |
| Graduated export | export route (level validation hardened) | `/project/[id]/export` | ✅ |
| Session playback + AI notes | sessions route + annotation parsing | `/project/[id]/sessions` | ✅ |

---

## Release gates snapshot (post phase 1–5 run)
- [x] `npm run lint` passes locally
- [x] `npm run build` passes locally
- [x] `npm run test:unit` passes locally
- [x] Prisma local checks re-run in this exact pass (`validate`, `format --check`, schema diff)
- [x] CI run-history pass-rate audit complete (root causes identified and remediations implemented in-branch)
- [ ] CI sustained-pass evidence post-remediation confirmed on default branch
- [x] Security/risk gate sign-off complete for current P0 blockers (phase 7)
- [ ] Staging deploy + smoke + rollback drill complete (phase 8+)
- [ ] Production deployment rehearsal via `.github/workflows/deploy.yml` complete

## Next actions (phase 6+)
1. Confirm sustained green trend in `ci.yml` and `security.yml` after current remediations merge.
2. Configure deployment secrets and environments for `deploy.yml`.
3. Execute staging deploy + smoke + rollback drill from `docs/deployment-runbook.md`.
4. Run first production deployment rehearsal with explicit confirmation gate.
