# Autonomous Deployment Plan (with critiques and revisions)

Date: 2026-04-05  
Target: Private beta readiness → deployable build

Note on critiques: The critiques below are simulated personas used to stress-test the plan. No real people were consulted.

## Canonical plan section
- **Canonical implementation target:** **Plan v3 (final)** in this document.
- **Historical context only:** Plan v0, Plan v1, and Plan v2 are retained as revision history and should not be used as active execution criteria.

## Current testing snapshot
- Existing tests: API contract tests in `src/app/api/__tests__`.
- No dedicated unit tests for services; no end-to-end flow tests.
- CI workflows exist but were not audited in this session.
- Tests have not been executed in this session.

## Starter step: nested AGENTS.md placement
Recommended locations (created as part of this implementation):
- `src/app/AGENTS.md`
- `src/app/api/AGENTS.md`
- `src/lib/AGENTS.md`
- `src/lib/server/AGENTS.md`
- `src/lib/ai/AGENTS.md`
- `prisma/AGENTS.md`
- `docs/AGENTS.md`

---

# Plan v0 (initial)

## Phase 0 — Align scope and definition of done
Objective: define what “private beta ready” means.
Tasks:
- Confirm the must-have feature list from README and the design brief.
- Define a private‑beta Definition of Done (DoD) for: auth, core flows, data integrity, AI safety, UI completeness.
Deliverables:
- DoD checklist in `docs/STATUS.md`.
Verification:
- DoD covers all 12 README features and critical UX paths.

## Phase 1 — Inventory and gap analysis
Objective: map vision to implementation.
Tasks:
- Build a feature matrix mapping each feature to API routes and UI screens.
- Identify missing or shallow UI screens.
Deliverables:
- Feature matrix in `docs/STATUS.md`.
Verification:
- Every README feature has a mapped backend and UI status.

## Phase 2 — UI completeness
Objective: complete missing feature pages.
Tasks:
- Add pages for analysis, gaps, tangents, patterns, concepts, contradictions, search.
- Extract dashboard widgets from `src/app/project/[id]/page.tsx` into components.
Deliverables:
- New page routes and refactored dashboard.
Verification:
- Every dashboard widget has a dedicated view.

## Phase 3 — Backend hardening
Objective: enforce consistent server patterns.
Tasks:
- Ensure all routes use `handleRoute`, `requireUser`, and validation helpers.
- Prefer services over direct repository calls where domain rules exist.
Deliverables:
- Consistent API error contracts and validation patterns.
Verification:
- Route handlers remain thin; domain logic is centralized.

## Phase 4 — AI safety and degradation
Objective: ensure safe behavior with and without API keys.
Tasks:
- Validate graceful degradation when `OPENAI_API_KEY` is missing.
- Add safeguards for long transcripts and parse failures.
Deliverables:
- Stable AI behavior with clear user messaging.
Verification:
- Recording and document flows still function without AI.

## Phase 5 — Testing expansion
Objective: introduce baseline automated coverage.
Tasks:
- Expand API contract tests for failure cases.
- Add unit tests for core services (analysis, questions, voice draft).
- Add a minimal end‑to‑end flow test for the happy path.
Deliverables:
- Test suite for critical flows.
Verification:
- Tests pass locally and in CI.

## Phase 6 — CI health
Objective: stabilize CI and reduce flake.
Tasks:
- Audit GitHub Actions history for failures and slow steps.
- Fix flaky checks and document ownership.
Deliverables:
- CI health summary in `docs/STATUS.md`.
Verification:
- CI checks pass reliably on main.

## Phase 7 — Security & privacy
Objective: confirm data safety.
Tasks:
- Validate access control on all project data routes.
- Review error logging for sensitive data.
Deliverables:
- Security checklist in `docs/STATUS.md`.
Verification:
- No unauthorized access paths; logs are sanitized.

## Phase 8 — Deployment preparation
Objective: establish a deployable pipeline.
Tasks:
- Define required environment variables and staging config.
- Ensure Prisma migrations are reproducible in staging.
Deliverables:
- Deployment checklist and runbook.
Verification:
- Staging deploy runs clean with a seeded test project.

## Phase 9 — Private beta launch
Objective: ship to beta cohort.
Tasks:
- Define metrics and feedback loops.
- Create a rollback plan.
Deliverables:
- Beta launch checklist.
Verification:
- Core flows complete and measurable.

---

# Critique 1 (harsh reviewer, simulated)
- The plan is too generic; lacks concrete acceptance criteria per phase.
- No dependency ordering or explicit gating between phases.
- Risk management is not specified.
- No ownership or accountability noted.

# Plan v1 (revised after critique 1)

## Phase 0 — Align scope and DoD
Objective: define private‑beta readiness in measurable terms.
Tasks:
- Define DoD with explicit acceptance criteria per core flow.
- Add a Go/No‑Go checklist.
Deliverables:
- DoD + Go/No‑Go list in `docs/STATUS.md`.
Verification:
- Each DoD item has a measurable pass/fail statement.

## Phase 1 — Inventory and gap analysis (gate)
Objective: prove feature coverage before building.
Tasks:
- Map each README feature to API + UI.
- Classify as Implemented / Partial / Missing.
Deliverables:
- Feature matrix with status and owners.
Verification:
- Matrix completed and reviewed.

## Phase 2 — UI completeness (depends on Phase 1)
Objective: remove UI gaps for critical features.
Tasks:
- Build missing pages (analysis, gaps, tangents, patterns, concepts, contradictions, search).
- Refactor dashboard into components with local tests.
Deliverables:
- Dedicated pages for all feature views.
Verification:
- Manual QA checklist confirms navigation + data visibility for each feature.

## Phase 3 — Backend hardening (parallel with Phase 2)
Objective: enforce consistent route/service patterns.
Tasks:
- Standardize route validation and error contracts.
- Move domain logic from routes into services where necessary.
Deliverables:
- Routes remain thin; services capture domain logic.
Verification:
- Static review confirms consistent use of `handleRoute` and auth guards.

## Phase 4 — AI safety and degradation (gate)
Objective: ensure AI failures do not break flows.
Tasks:
- Test with and without API key.
- Introduce safeguards for parsing and length limits.
Deliverables:
- Explicit fallback behavior documented in `docs/STATUS.md`.
Verification:
- Recording and documents flows complete without AI.

## Phase 5 — Testing expansion (gate)
Objective: establish minimum automated coverage.
Tasks:
- Contract tests for negative cases.
- Unit tests for analysis/questions/voice‑draft services.
- One end‑to‑end happy path test.
Deliverables:
- Test suite coverage for core flows.
Verification:
- All tests pass locally and in CI.

## Phase 6 — CI health (depends on Phase 5)
Objective: reduce flake and maintain trust.
Tasks:
- Audit CI history; document failure root causes.
- Fix flaky steps; add ownership.
Deliverables:
- CI health note in `docs/STATUS.md`.
Verification:
- CI passes reliably for 5 consecutive runs.

## Phase 7 — Security & privacy (gate)
Objective: prevent unauthorized access and data leaks.
Tasks:
- Audit project access routes.
- Validate log redaction.
Deliverables:
- Security checklist with pass/fail results.
Verification:
- No auth bypass or data leakage found.

## Phase 8 — Deployment preparation (gate)
Objective: confirm staging readiness.
Tasks:
- Define env vars and secrets list.
- Verify Prisma migrations on staging.
Deliverables:
- Deployment runbook.
Verification:
- Staging deploy + smoke test passes.

## Phase 9 — Private beta launch (gate)
Objective: ship to a controlled cohort.
Tasks:
- Define beta metrics and feedback channels.
- Prepare rollback procedures.
Deliverables:
- Beta launch checklist.
Verification:
- Rollback tested; metrics defined.

---

# Critique 2 (hostile reviewer, simulated)
- Still missing explicit risk register and mitigation plans.
- “Manual QA” is vague and not tied to the DoD.
- No concrete deployment steps or environment ownership.
- Lacks a measurable product success metric.

# Plan v2 (revised after critique 2)

## Phase 0 — Align scope, DoD, and success metrics
Objective: define readiness and success in measurable terms.
Tasks:
- DoD checklist for each core flow.
- Define 2–3 beta success metrics (e.g., weekly active writers, completed sessions per user).
Deliverables:
- DoD + metrics in `docs/STATUS.md`.
Verification:
- Metrics have target thresholds.

## Phase 1 — Inventory and gap analysis (gate)
Objective: baseline coverage and ownership.
Tasks:
- Feature matrix with Implemented/Partial/Missing.
- Assign owners to each missing item.
Deliverables:
- Feature matrix with owners.
Verification:
- All items have owners and dates.

## Phase 2 — UI completeness (depends on Phase 1)
Objective: complete feature views and remove UX dead ends.
Tasks:
- Implement missing pages.
- Add a “See details” path from each dashboard widget to its page.
Deliverables:
- Dedicated views with navigation.
Verification:
- Manual QA checklist maps to DoD items.

## Phase 3 — Backend hardening (parallel with Phase 2)
Objective: consistent domain logic and safe persistence.
Tasks:
- Use `handleRoute` + validation on all routes.
- Enforce service usage for domain rules.
Deliverables:
- Consistent error contracts and access checks.
Verification:
- Route inspection pass on all project endpoints.

## Phase 4 — AI safety and degradation (gate)
Objective: safe failure behavior.
Tasks:
- Test no‑key scenario.
- Guard large inputs; log parse errors safely.
Deliverables:
- Fallback states defined per endpoint.
Verification:
- No user‑blocking errors when AI fails.

## Phase 5 — Testing expansion (gate)
Objective: automated proof for core flows.
Tasks:
- Contract tests for failures and edge cases.
- Unit tests for service layer (analysis, questions, voice‑draft).
- End‑to‑end test for sign‑in → create project → record → export.
Deliverables:
- Automated test coverage for the happy path and major failures.
Verification:
- Tests pass in CI and locally.

## Phase 6 — CI health (depends on Phase 5)
Objective: stable CI and clear ownership.
Tasks:
- Record a CI health score (pass rate, duration).
- Fix flake; document owners.
Deliverables:
- CI health report in `docs/STATUS.md`.
Verification:
- Pass rate exceeds 95% for 2 weeks.

## Phase 7 — Security & privacy (gate)
Objective: access safety and data handling.
Tasks:
- Review access control for all routes.
- Confirm no sensitive data in logs.
Deliverables:
- Security audit checklist.
Verification:
- No auth bypass; logs validated.

## Phase 8 — Risk register (gate)
Objective: identify and mitigate deployment risks.
Tasks:
- List top 5 risks (AI failure, data loss, auth bypass, CI flake, cost spikes).
- Assign owners and mitigations.
Deliverables:
- Risk register in `docs/STATUS.md`.
Verification:
- Each risk has mitigation and rollback.

## Phase 9 — Deployment preparation (gate)
Objective: deployable build with runbook.
Tasks:
- Document env vars, secrets, and ownership.
- Define migration steps and rollback.
Deliverables:
- Deployment runbook.
Verification:
- Staging deploy + smoke test passes.

## Phase 10 — Private beta launch (gate)
Objective: controlled rollout.
Tasks:
- Invite cohort; track success metrics.
- Collect feedback and iterate.
Deliverables:
- Beta launch checklist.
Verification:
- Metrics collected for 2 weeks.

---

# Critique 3 (Rizza + Uncle Bob, simulated)
Rizza (product/UX focus):
- The plan is still too heavy. Focus on the shortest path to user value.
- Clarify the “north star” UX flows and prioritize them.

Uncle Bob (clean architecture focus):
- The UI god‑component needs explicit refactoring tasks.
- `AiPort` is too broad; plan should split interfaces.
- Testing should include strict boundaries and contract checks.

# Plan v3 (final)

## Phase 0 — Readiness definition and north‑star flows (gate)
Objective: align on private‑beta definition and UX priorities.
Tasks:
- Define 3 north‑star flows: sign‑in → create project, record → analyze, documents → export.
- Define DoD and success metrics per flow.
Deliverables:
- DoD + success metrics in `docs/STATUS.md`.
Verification:
- Metrics have clear thresholds and owners.

## Phase 1 — Feature matrix and scope lock (gate)
Objective: freeze scope for beta.
Tasks:
- Complete feature matrix and mark non‑critical items as post‑beta.
- Assign owners and dates to all beta‑critical items.
Deliverables:
- Feature matrix with scope lock.
Verification:
- All beta‑critical items are scoped and dated.

## Phase 2 — UI completion for beta‑critical views (depends on Phase 1)
Objective: deliver user‑visible feature depth.
Tasks:
- Implement missing pages: analysis, gaps, tangents, patterns, concepts, contradictions, search.
- Add “View details” links from dashboard widgets.
- Extract dashboard widgets into components to reduce `ProjectPage` responsibilities.
Deliverables:
- Dedicated pages and refactored dashboard components.
Verification:
- Manual QA checklist confirms each feature has a full view.

## Phase 3 — Backend consistency and SOLID cleanup (parallel with Phase 2)
Objective: enforce clean architecture boundaries.
Tasks:
- Standardize route validation and error contracts via `handleRoute`.
- Move domain logic from routes to services.
- Split `AiPort` into smaller interfaces if provider divergence grows (analysis, questions, transcription, writing).
Deliverables:
- Consistent route/service patterns and narrower interfaces.
Verification:
- Routes remain thin; ports are cohesive.

## Phase 4 — AI safety and graceful degradation (gate)
Objective: stable behavior with and without AI.
Tasks:
- Validate no‑key behavior for record and document flows.
- Guard large inputs and parsing failures with safe fallbacks.
Deliverables:
- Documented fallback behaviors per AI endpoint.
Verification:
- UX remains functional without AI.

## Phase 5 — Testing strategy (gate)
Objective: automated proof of core flows and boundaries.
Tasks:
- Expand API contract tests for failure cases.
- Add unit tests for analysis/questions/voice‑draft services.
- Add one end‑to‑end test covering the north‑star flow.
Deliverables:
- Contract + unit + e2e tests for core flows.
Verification:
- All tests pass locally and in CI.

## Phase 6 — CI health and quality gates (depends on Phase 5)
Objective: reliable CI.
Tasks:
- Audit CI run history and flake rate.
- Fix flake and document owners.
Deliverables:
- CI health report in `docs/STATUS.md`.
Verification:
- Pass rate exceeds 95% for two weeks.

## Phase 7 — Security, privacy, and risk register (gate)
Objective: deployment safety.
Tasks:
- Audit auth access routes.
- Validate log redaction.
- Maintain a risk register with mitigations.
Deliverables:
- Security checklist + risk register.
Verification:
- No auth bypass; risks have rollback steps.

## Phase 8 — Deployment runbook and staging (gate)
Objective: deployable build.
Tasks:
- Document env vars and secrets ownership.
- Validate Prisma migrations in staging.
- Run smoke tests on staging.
Deliverables:
- Deployment runbook.
Verification:
- Staging deploy passes smoke tests.

## Phase 9 — Private beta launch (gate)
Objective: ship to a controlled cohort.
Tasks:
- Invite cohort and monitor success metrics.
- Collect feedback and iterate.
Deliverables:
- Beta launch checklist and feedback log.
Verification:
- Success metrics meet thresholds after two weeks.
