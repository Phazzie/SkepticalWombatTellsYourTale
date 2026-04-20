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

### B2 · Export checkbox accessibility
**Status:** ✅ Already resolved. `src/app/project/[id]/export/page.tsx` wraps each `<input type="checkbox">` inside a `<label>` element that also contains visible text, giving each checkbox an accessible name via the native label association. No further changes needed; issue #22 can be closed.

---

### B3 · `parseAiJsonObjectStrict` null branch coverage
**Status:** ✅ Already resolved. `src/lib/ai/__tests__/parsing.test.ts` already contains:
- A test asserting `parseError: 'missing_content'` when `content` is `null`.
- A test asserting `parseError` is set and `contractIssues` contains `'AI response JSON parse failed'` when `normalize` throws.

No additional tests are needed; issue #52 can be closed.

---

### B4 · Address remaining PR #21 review feedback (issue #31)
**Status:** ✅ Outdated — safe to close. The review comment on PR #21 concerned orbit placement math in `dashboard-insights-grid.tsx`, where `total` (all items combined) was used to compute angle steps but the orbit rendered only up to 12 items. That component has since been rewritten as a simple three-column grid with no orbit layout; the problematic code no longer exists. Issue #31 should be closed as `not_planned` with a note that the component was redesigned.

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
**Note:** Behaviour when this key is missing or invalid varies by endpoint:
- **`/api/transcribe`** — catches the OpenAI error, stores a placeholder transcript (`[Transcription unavailable — configure OpenAI API key]`), and returns **200** with the session ID. The app continues to function.
- **`/api/projects/[id]/analyze`, `/questions`, `/voice-draft`, `/concepts`, `/contradictions`** — the OpenAI call is not caught at the service layer; an unhandled error propagates to the global handler and returns **500**. These features will be broken without the key.

Set the key before enabling any AI features in production.

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
- [ ] Verify AI degraded mode: temporarily unset `OPENAI_API_KEY` and confirm:
  - `/api/transcribe` still returns **200** with a placeholder transcript (expected graceful degradation).
  - `/api/projects/[id]/analyze`, `/questions`, `/voice-draft`, `/concepts`, and `/contradictions` return **500** (expected — these endpoints require the key).

### D5 · Rollback drill
Before go-live, confirm you can roll back:
- Know which deployment version to revert to
- Confirm `DATABASE_URL` points to a database that is compatible with the previous schema (**caution**: `db push` is not append-only — schema changes can be destructive on SQLite; take a backup of the `.db` file before applying any schema change)
- Document the one-liner to revert the deployment

---

## Remaining open GitHub issues

| # | Title (short) | Section above | Status |
|---|---|---|---|
| #31 | PR #21 Copilot review feedback | B4 | Close as `not_planned` — component rewritten |
| #22 | Export checkbox accessibility | B2 | Close as `not_planned` — already resolved |
| #52 | `parseAiJsonObjectStrict` null/normalize-throws paths | B3 | Close as `not_planned` — already tested |
| #59 | `ALLOWED_AUDIO_MIME_TYPES` mutable | B1 | Fixed in this PR |

All other issues (25 total) were confirmed fixed by merged PRs and have been closed.
