# Roadmap

This roadmap aligns the current implementation with the original product vision and targets private‑beta readiness.

## Now (Private Beta Readiness — next 1–2 sprints)

### Governance & visibility
- Maintain `docs/STATUS.md` with a feature matrix and readiness rubric.
- Maintain `CHANGELOG.md` (Keep a Changelog format).
- Monthly retros in `docs/LESSONS_LEARNED.md`.

### UI completeness (feature depth)
- Dedicated pages for: Analysis, Gaps, Tangents, Concepts, Contradictions, Patterns, Search.
- Reduce the size of `src/app/project/[id]/page.tsx` by extracting dashboard widgets into components.

### Reliability & QA
- Manual QA checklist for critical flows (auth → create project → record → review → documents → export).
- Expand API contract tests to cover edge cases and failure paths.
- Add service-level tests for analysis, questions, and voice-draft workflows.

### AI safety & cost
- Verify graceful degradation without `OPENAI_API_KEY`.
- Add guardrails for large transcripts and retry behavior.

### CI health
- Audit GitHub Actions stability and runtime.
- Address flaky checks and document ownership for CI fixes.

## Next (Post‑beta hardening — this quarter)
- Role‑based collaboration (`ProjectMember` roles).
- Search improvements (filters, ranking, highlight context).
- Export customization templates and formatting options.
- Accessibility audit versus design brief.
- Observability dashboard for API errors/latency.

## Later (Vision expansion)
- Advanced narrative structuring tools and outline builders.
- Cross‑project thematic clustering and “pattern of patterns” insights.
- Rich collaboration and reviewer workflows.
