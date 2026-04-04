# AGENTS.md

This file is the integration contract for any agent working in this repository.

## Mission

Ship correct, minimal, production-safe changes without breaking other agents’ work.

## Single Source of Truth

- Follow this file first for agent behavior.
- Use `README.md` for product/setup context.
- Use existing code patterns before inventing new ones.

## Repo Basics

- Stack: Next.js (App Router) + TypeScript + Prisma + SQLite.
- Main app code: `src/app` and `src/lib`.
- Prisma schema: `prisma/schema.prisma`.

## Required Validation Commands

Run these from repo root before handing work off:

1. `npm run lint`
2. `npm run build`

If dependencies are missing, run `npm ci` first.

## Multi-Agent Integration Rules

### 1) Scope ownership

- Touch only files needed for your task.
- Do not refactor unrelated areas.
- Do not “clean up” unrelated code while implementing your change.

### 2) Explicit contracts

- Keep public API shapes stable unless the task explicitly requires a contract change.
- If you must change a request/response shape, update all impacted callers in the same change.
- Preserve existing type names and semantics unless change is required.

### 3) Database safety

- Any Prisma schema change must include corresponding app updates.
- For schema changes, ensure project still builds after `npx prisma db push` (local workflow) and `npm run build`.
- Do not assume unsupported Prisma/SQLite features are available.

### 4) Routing and behavior

- Keep existing route paths and HTTP methods stable unless requested otherwise.
- Maintain graceful error handling patterns already used by nearby routes.

### 5) Frontend integration

- If backend responses change, update related UI pages/components immediately.
- Do not introduce visual or UX changes outside the requested scope.

### 6) Environment and secrets

- Never commit secrets.
- Keep OpenAI-dependent behavior graceful when key is missing (follow current app behavior).

### 7) Dependency changes

- Do not add or upgrade dependencies unless necessary for the task.
- If dependency changes are required, keep them minimal and justify in your handoff note.

## Preemptive Integration Checklist (Answer Before Finalizing)

- What files/interfaces did I change?
- Which routes, pages, or libs consume those interfaces?
- Did I update every impacted caller?
- Did I preserve backward compatibility where expected?
- Did I run `npm run lint` and `npm run build`?
- Did I avoid unrelated edits?
- Did I avoid committing secrets or unsafe defaults?

## Handoff Format (Use in PR/agent output)

Provide a short handoff with:

1. **Changed files** (exact list)
2. **Behavior changes** (what is different now)
3. **Integration impact** (who depends on this)
4. **Validation results** (`lint`, `build`)
5. **Risks / follow-ups** (if any)

## Do / Don’t

### Do

- Make surgical, reversible changes.
- Reuse existing patterns in neighboring files.
- Keep types and API contracts consistent.
- Validate before handoff.

### Don’t

- Don’t change unrelated files.
- Don’t silently change API contracts.
- Don’t skip lint/build validation.
- Don’t introduce new dependencies without necessity.
- Don’t commit generated noise or temporary files.
