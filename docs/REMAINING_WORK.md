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
**Status:** Already resolved — each checkbox input is wrapped in a visible `<label>`, so the control has an accessible name.
**Action:** Keep this as a periodic a11y regression check only.
**Verify:** `npm run lint && npm run build`

---

### B3 · Verify `parseAiJsonObjectStrict` null branch is covered
**File:** `src/lib/ai/__tests__/parsing.test.ts`
**Status:** Already covered — current tests include both `content: null` handling and the `normalize`-throws path.
**Action:** Keep this as regression coverage verification, no new test needed right now.
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
**Note:** Startup succeeds without this key. Behavior is endpoint-specific: some AI endpoints return `400`, while transcription currently falls back gracefully instead of hard-failing.

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
- [ ] Verify AI degraded mode: temporarily unset `OPENAI_API_KEY` and confirm analysis/questions/voice-draft endpoints return controlled `400` responses, while transcription still returns its fallback behavior (no `500`)

### D5 · Rollback drill
Before go-live, confirm you can roll back:
- Know which deployment version to revert to
- Take a database snapshot/backup before applying schema changes and confirm `DATABASE_URL` points to a database compatible with the target rollback version (schema rollbacks can be destructive)
- Document the one-liner to revert the deployment

---

## Remaining open GitHub issues (2)

| # | Title (short) | Section above |
|---|---|---|
| #31 | PR #21 Copilot review feedback | B4 |
| #59 | `ALLOWED_AUDIO_MIME_TYPES` mutable | B1 |

This table tracks only issues directly mapped to this checklist; see GitHub Issues for the complete live backlog.
