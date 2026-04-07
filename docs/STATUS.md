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
- [ ] Prisma local checks re-run in this exact pass (`validate`, `format --check`, schema diff)
- [ ] CI run-history pass-rate audit complete (phase 6)
- [ ] Security/risk gate sign-off complete (phase 7+)
- [ ] Staging deploy + smoke + rollback drill complete (phase 8+)

## Next actions (phase 6+)
1. Run CI run-history audit and flake remediation loop.
2. Complete security/risk register gate and sign-off.
3. Execute staging runbook + smoke test + rollback drill.
4. Ship private beta with metric monitoring.
