# Lessons Learned

## 2026-04 (Month 1)

### What went well
- Clear server layering (routes → services → repositories) makes the backend easy to reason about.
- Ports/adapters isolate AI and persistence logic, keeping integrations replaceable.
- Core user flows (record → analyze → documents → export) are already functional.

### Pain points
- Progress visibility was low (no roadmap/status/changelog), making ownership unclear.
- UI feature depth is uneven: some capabilities only appear as dashboard summary widgets.
- Route validation patterns vary (some routes validate inline vs schema-based), increasing drift risk.

### Decisions
- Establish governance docs and monthly retros as a default practice.
- Track readiness against a private‑beta rubric in `docs/STATUS.md`.

### Action items
- Build dedicated pages for gaps, tangents, concepts, contradictions, patterns, and search.
- Add service-level tests for analysis, questions, and voice-draft flows.
- Run a CI health audit and fix any flaky or slow checks.
