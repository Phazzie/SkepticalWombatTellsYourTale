# Remaining Work Before Deployment

Every item below is atomic — one file, one change, one test. Copilot can take any section independently.

---

## Section A — Security (do first)

### A1 · Bump Next.js to 15.5.15 (CVE-2026-23869)
**Status:** Done in this PR (`package.json` + `package-lock.json` already updated).
**Verify:** `npm ci && npm run build` passes.

---

## Section B — Code Fixes (4 items)

### B1 · Make `ALLOWED_AUDIO_MIME_TYPES` immutable
**File:** `src/lib/server/routes/transcribe.ts`
**Problem:** Exported as `new Set([...])` — any consumer can call `.add()` / `.delete()` and silently corrupt MIME validation globally.
**Fix:** Change to `ReadonlySet<string>`:
```ts
// before
export const ALLOWED_AUDIO_MIME_TYPES = new Set([...]);

// after
export const ALLOWED_AUDIO_MIME_TYPES: ReadonlySet<string> = new Set([...]);
```
**Also update:** `src/app/api/__tests__/transcribe.contract.test.ts` — import still works; iteration with `for...of` still works. No callers mutate it so no other changes needed.
**Verify:** `npm run lint && npm run test:unit`

---

### B2 · Fix export checkbox accessibility
**File:** `src/app/project/[id]/export/page.tsx`
**Problem:** The native `<input type="checkbox">` is hidden with `sr-only` but has no `id` or `aria-labelledby` linking it to its visible label. Screen readers and keyboard users cannot identify what the checkbox controls.
**Fix:** Add an `id` to each checkbox `<input>` and a matching `htmlFor` on the visible label element (or wrap both in a `<label>`).
**Verify:** `npm run lint && npm run build`

---

### B3 · Verify `parseAiJsonObjectStrict` null branch is covered
**File:** `src/lib/ai/__tests__/parsing.test.ts`
**Problem:** `parseAiJsonObjectStrict` has a distinct code path when the AI returns a `null` body (not invalid JSON, but literal `null`). This path is untested; a production AI response returning `null` could surface an unhandled edge case.
**Fix:** Add one test:
```ts
it('returns fallback when AI response body is null', () => {
  const result = parseAiJsonObjectStrict(null, defaultFallback, { normalize: (v) => v });
  assert.deepStrictEqual(result.value, defaultFallback);
  assert.ok(result.contractIssues.length > 0);
});
```
Adjust the exact API signature to match the current function signature.
**Verify:** `npm run test:unit`

---

### B4 · Address remaining PR #21 review feedback (issue #31)
**Context:** Issue #31 was auto-filed from a Copilot review of PR #21 ("Gold" listening-room UX). The feedback was marked as non-blocking at the time but was never resolved or explicitly dismissed.
**Action:** Read issue #31 on GitHub, determine if the feedback is still applicable to current code, and either apply the fix or close the issue as `not_planned` with a comment explaining why it no longer applies.
**File(s):** Likely in `src/app/project/[id]/record/` or `src/components/`.
**Verify:** `npm run lint && npm run build`

---

## Section C — Environment Setup (must be done on the server, not in code)

These cannot be committed — they must be set in the hosting platform's environment configuration.

### C1 · Set `NEXTAUTH_SECRET`
**Where:** Hosting platform env vars (Vercel: Project Settings → Environment Variables).
**Value:** A random 32-byte hex string. Generate with: `openssl rand -hex 32`
**Why:** NextAuth requires this to sign JWT session tokens. Without it, all sign-in attempts will fail in production.

### C2 · Set `NEXTAUTH_URL`
**Where:** Hosting platform env vars.
**Value:** The full public URL of the deployed app, e.g. `https://yourapp.vercel.app`
**Why:** NextAuth uses this to construct OAuth callback URLs and redirect correctly.

### C3 · Set `DATABASE_URL`
**Where:** Hosting platform env vars.
**Value:** `file:./prod.db` for single-instance SQLite, or a connection string for a hosted database.
**Note:** SQLite is fine for private beta on a single instance. If you plan to run more than one dyno/container, switch to PostgreSQL or PlanetScale before launch.

### C4 · Set `OPENAI_API_KEY`
**Where:** Hosting platform env vars.
**Value:** Your OpenAI API key.
**Note:** The app gracefully degrades (returns 400) when this is missing, so startup will succeed without it — but transcription and AI features will be unavailable.

---

## Section D — Deployment Operations (run once, in order)

### D1 · Run database migration on production
```bash
DATABASE_URL=<prod-value> npx prisma db push
```
Do this before starting the server for the first time, or after any schema change.

### D2 · Verify CI checks are set as required on `main`
**Where:** GitHub → Repository Settings → Branches → Branch protection rules for `main`.
**Required checks to add** (from `README.md`):
- `CI / Quality (Node 18.x)` and `CI / Quality (Node 20.x)`
- `CI / Build (Node 18.x)` and `CI / Build (Node 20.x)`
- `CI / Prisma Schema (Node 18.x)` and `CI / Prisma Schema (Node 20.x)`
- `Security / CodeQL`
- `Security / Dependency Audit (Node 18.x)` and `Security / Dependency Audit (Node 20.x)`

### D3 · Close dependabot PR #54
**Action:** PR #54 (the Next.js 15.5.15 dependabot bump) is superseded by this PR. After this PR merges, close PR #54 without merging to keep the branch list clean.

### D4 · Staging deploy + smoke test
Before releasing to real users, deploy to a staging environment and manually verify:
- [ ] Register a new account
- [ ] Sign in / sign out
- [ ] Create a project
- [ ] Record a voice session (requires `OPENAI_API_KEY`)
- [ ] Generate questions
- [ ] Export at each level (raw / structured / polished / full)
- [ ] Search within a project
- [ ] Verify AI degraded mode: temporarily unset `OPENAI_API_KEY` and confirm the app returns a 400 (not a 500) for AI endpoints

### D5 · Rollback drill
Before go-live, confirm you can roll back:
- Know which deployment version to revert to
- Confirm `DATABASE_URL` points to a database that is compatible with the previous schema (SQLite with `db push` is append-only; rollback is safe)
- Document the one-liner to revert the deployment

---

## Remaining open GitHub issues (4)

| # | Title (short) | Section above |
|---|---|---|
| #22 | Export checkbox accessibility | B2 |
| #31 | PR #21 Copilot review feedback | B4 |
| #52 | `parseAiJsonObjectStrict` null path | B3 |
| #59 | `ALLOWED_AUDIO_MIME_TYPES` mutable | B1 |

All other issues (25 total) were confirmed fixed by merged PRs and have been closed.
