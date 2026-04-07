# UI REDESIGN FOLLOW-UP EXECUTION PLAN (POST-PR20)
## SkepticalWombatTellsYourTale: Stabilization and Tightening Plan

**Status**: Ready for execution
**Scope**: High-impact follow-up only (surgical PRs)
**Approach**: Small, reviewable phases with repo-native validation gates

---

## Objective

Tighten the merged PR #20 redesign by addressing known review risks first, consolidating design-token behavior, and validating UX/accessibility in measured, repository-compatible phases.

---

## Must-Do Backlog (Phase A priority)

1. Replace loading-dot animation implementation so dots do not reuse waveform height animation.
2. Resolve neon token/class conflict and opacity behavior inconsistency by using a single token path.
3. Prevent Enter-triggered concurrent searches while search is already in progress.
4. Correct WCAG wording mismatch by choosing one explicit target and ratio.
5. Standardize project naming in this document.

---

## Explicit Accessibility Target

This follow-up plan uses **WCAG 2.2 AA** as the required baseline:
- **Normal text contrast**: at least **4.5:1**
- **Large text contrast**: at least **3:1**

(AAA can be pursued opportunistically but is not a release gate for this follow-up.)

---

## Execution Phases (PR-by-PR)

### Phase A — Stabilization PR (must-do)
Focus only on the 5 known PR20 review findings.

**Exit criteria**
- Loading dots use dedicated subtle animation.
- Search input Enter key respects `searching` state.
- Neon class/token conflict removed.
- Opacity-modified neon utilities behave consistently.
- Doc naming + WCAG wording corrected and consistent.

### Phase B — Token Consolidation PR
Consolidate neon design tokens to one source of truth and remove dual API ambiguity.

**Exit criteria**
- Tailwind token usage is the default path for neon colors.
- Dim/border variants are explicit and predictable.
- No duplicate utility-name collisions between custom CSS and Tailwind-generated utilities.

### Phase C — UX Hardening PR
Address targeted interaction quality without broad redesign churn.

**Scope examples**
- Keyboard/search edge cases
- Reduced-motion behavior polish
- Interaction consistency across key cards/forms

**Exit criteria**
- No interaction regressions in primary flows.
- Keyboard behavior matches visible button disabled states.

### Phase D — Accessibility Verification PR
Lock accessibility checks and residual fixes into one pass.

**Exit criteria**
- WCAG AA contrast verification complete for key screens.
- Aria-live behavior is useful and not noisy.
- Keyboard-only navigation pass for critical flows.

---

## Validation Gates (per phase)

Run all existing repository checks:

1. `npm run lint`
2. `npm run build`
3. `npm run test:unit`

Add targeted manual checks per phase as needed (accessibility and keyboard behavior), but do not introduce unrelated tooling changes.

---

## Output Contract (per phase)

For each phase PR, provide a concise handoff:

1. **Changed files**
2. **Behavior changes**
3. **Integration impact**
4. **Validation results** (`lint`, `build`, `test:unit`)
5. **Risks / follow-ups**

---

## Out of Scope for this Follow-Up

- Full "96% overhaul" expansion work not tied to known risk items
- New framework/tooling migrations (e.g., replacing existing test stack)
- Broad refactors unrelated to stabilization, token consistency, UX hardening, or a11y verification

---

## Next Action

Start with **Phase A** and keep the diff minimal.
