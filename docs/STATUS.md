# Project Status

**Date:** 2026-04-04  
**Target readiness:** Private beta

## Executive summary
- **Backend:** Largely implemented with clear layering (routes → services → repositories) and AI integrations through ports/adapters.
- **Auth/Authorization:** Implemented via NextAuth (`requireUser`) and project access checks (`ensureProjectAccess`).
- **UI:** Core flows exist (auth, project list, record, sessions, documents, questions, export). Several feature areas are only represented as dashboard widgets, with no dedicated pages yet.
- **Governance:** Roadmap, changelog, lessons learned, and UI tour are now in place. CI health still needs a run‑history audit.

## Readiness rubric

| Area | Status | Notes |
| --- | --- | --- |
| Auth & authorization | 🟢 | `requireUser` + `ensureProjectAccess` enforced across routes. |
| Core data flows | 🟢 | Projects, documents, sessions, and export flows are implemented. |
| AI workflows | 🟡 | Implemented; graceful‑degradation behavior should be verified without API key. |
| UI completeness | 🟡 | Core flows done; dedicated pages missing for several feature views. |
| UX consistency | 🟡 | Mix of shared primitives and bespoke UI; dashboard component is large. |
| Observability & error handling | 🟡 | `handleRoute` + correlation IDs in API; client error handling varies. |
| CI health | 🟡 | Workflows exist; run history not audited in this pass. |
| Governance docs | 🟢 | Roadmap, changelog, lessons learned, UI tour created. |

## Vision‑to‑implementation matrix

| Feature (from README) | Backend / API | UI | Notes |
| --- | --- | --- | --- |
| Voice‑first input | ✅ `/api/transcribe`, `/api/projects/[id]/analyze` | ✅ `/project/[id]/record` | MediaRecorder + live transcript + analysis panels. |
| Project‑aware AI partner | ✅ `analysis.service.ts` + AI ports | ✅ Record flow | Uses project context from persistence port. |
| Living document structure | ✅ Documents CRUD routes | ✅ `/project/[id]/documents` | Document types supported. |
| Tangent tracker | ✅ Analysis pipeline persists tangents | ⚠️ Dashboard widget only | Dedicated page missing. |
| Gap detection | ✅ Analysis pipeline persists gaps | ⚠️ Dashboard widget only | Dedicated page missing. |
| Question generation | ✅ Questions service + routes | ✅ `/project/[id]/questions` | “Answer” links drive to record flow. |
| Pattern recognition | ✅ Analysis pipeline persists patterns | ⚠️ Dashboard widget only | Dedicated page missing. |
| Contradiction flagging | ✅ Contradictions route | ⚠️ Dashboard widget only | Dedicated page missing. |
| Voice preservation mode | ✅ Voice‑draft route | ✅ Documents page prompt | No separate voice‑draft page. |
| “Say what you suspect” | ✅ Analysis result (significance) | ✅ Record flow | Displayed as “What the AI noticed.” |
| Graduated export | ✅ Export route | ✅ `/project/[id]/export` | Levels: raw/structured/polished/full. |
| Session playback + AI notes | ✅ Sessions route | ✅ `/project/[id]/sessions` | Annotation list supported. |

### Additional UI capabilities (not in README)
- **Project search** widget on dashboard (`/api/projects/[id]/search`).
- **Concept approval** and **contradiction updates** in dashboard widgets.

## SOLID audit (summary)

### S — Single Responsibility
- ✅ Backend layers are SRP‑aligned: routes are thin, services orchestrate, repositories encapsulate persistence.
- ⚠️ `src/app/project/[id]/page.tsx` handles fetching, tangents, gaps, concepts, contradictions, search, and multiple widgets. Recommend extracting widgets and hooks to reduce coupling.

### O — Open/Closed
- ✅ Ports/adapters allow new AI providers or persistence strategies without changing services.
- ⚠️ Some routes validate inline (vs schema‑based) which can make future changes more invasive.

### L — Liskov Substitution
- ✅ Minimal inheritance; port implementations follow interface contracts.

### I — Interface Segregation
- ✅ Most ports are narrow and focused (e.g., analysis persistence).
- ⚠️ `AiPort` combines analysis, questions, transcription, and writing. Consider splitting if providers diverge.

### D — Dependency Inversion
- ✅ Services accept injected dependencies; default adapters are centralized.
- ⚠️ A few routes call repositories directly (e.g., project create/update). Prefer service routing for consistent domain rules.

## UI inventory

**Implemented pages**
- `/` → `src/app/page.tsx` (project list)
- `/sign-in`, `/register` → auth pages
- `/project/[id]` → dashboard (summary widgets)
- `/project/[id]/record` → voice capture + analysis
- `/project/[id]/sessions` → session playback + annotations
- `/project/[id]/documents` → document editing + voice draft
- `/project/[id]/questions` → question list/filters
- `/project/[id]/export` → graduated export

**Missing dedicated pages**
- `/project/[id]/analyze`
- `/project/[id]/gaps`
- `/project/[id]/tangents`
- `/project/[id]/patterns`
- `/project/[id]/concepts`
- `/project/[id]/contradictions`
- `/project/[id]/search`

## Next actions (private‑beta critical path)
1. Build dedicated pages for gaps/tangents/patterns/concepts/contradictions/search.
2. Refactor dashboard (`ProjectPage`) into smaller components and hooks.
3. Verify AI graceful degradation by running without `OPENAI_API_KEY`.
4. Audit CI run history and fix any flaky or slow checks.
