# SkepticalWombatTellsYourTale

> **The AI that makes your thinking harder.** Voice-first storytelling and memoir app — where talking is the input, and the AI pushes, notices, and holds the threads you drop.

## Features

1. 🎙️ **Voice-first input** — Talk, don't type. Records, transcribes (Whisper), and keeps the raw transcript intact.
2. 🧠 **Project-aware AI partner** — Reads everything in the project, remembers it across sessions. Connects what you said three weeks ago.
3. 📄 **Living document structure** — Multiple working documents (stories, concepts, structure, unfinished...). AI suggests where new material belongs.
4. 🧵 **Tangent tracker** — Detects abandoned threads mid-thought. Surfaces them: "you started saying something about X and didn't finish."
5. 🔍 **Gap detection** — Reads across all documents to find specific missing pieces. Not "you need more content" — specific gaps.
6. ❓ **Question generation** — Interviewer-style specific questions based on your material. Delivered as prompts to respond to by voice.
7. 🔁 **Pattern recognition** — Notices when two stories told weeks apart illustrate the same thing. Names the pattern.
8. ⚠️ **Contradiction flagging** — When new material conflicts with existing content, surfaces the tension.
9. ✍️ **Voice preservation mode** — Writes in your actual voice as learned from your transcripts. Not a cleaned-up version.
10. ⚡ **"Say what you suspect"** — Names the significance of things you describe casually. Treats "I don't know why I did that" as the most important sentence.
11. 📤 **Graduated export** — 4 export levels (raw/structured/polished/full). Raw transcripts preserved alongside polished versions.
12. 📼 **Session playback with AI annotations** — Go back to any session with AI coach notes layered on: "this is where you said the important thing."

## Tech Stack

- **Framework**: Next.js 15 (App Router) + TypeScript
- **Styling**: Tailwind CSS
- **Database**: SQLite via Prisma
- **AI**: OpenAI GPT-4o (analysis) + Whisper (transcription)
- **Voice**: MediaRecorder API + Web Speech API (live preview)

## Setup

### Prerequisites
- Node.js 18+
- An OpenAI API key

### Installation

```bash
npm install
```

### Environment

Copy `.env.example` to `.env` and fill in your OpenAI API key:

```bash
cp .env.example .env
# Edit .env and set OPENAI_API_KEY=your-key-here
```

### Database

```bash
npx prisma db push
```

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## CI

This repository uses GitHub Actions for CI, security, and release-readiness checks.

### Required pull request checks

The CI workflow uses a Node matrix (`18.x`, `20.x`), so each check appears once per Node version:

- **CI / Quality (Node 18.x)** and **CI / Quality (Node 20.x)** — `npm ci` + `npm run lint`
- **CI / Build (Node 18.x)** and **CI / Build (Node 20.x)** — `npm ci` + `npm run build`
- **CI / Prisma Schema (Node 18.x)** and **CI / Prisma Schema (Node 20.x)** — `npx prisma validate`, `npx prisma format --check`, and schema diff generation check
- **Security / CodeQL**
- **Security / Dependency Audit (Node 18.x)** and **Security / Dependency Audit (Node 20.x)**

Set these checks as **required** in branch protection for `main` so merges are blocked until they pass.

### Expected local verification commands

```bash
npm ci
npm run lint
npm run build
npx prisma validate
npx prisma format --check
npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script > /tmp/prisma-schema.sql
```

### CI failure triage flow

1. **lint fails** → fix ESLint issues and re-run `npm run lint`.
2. **build fails** → reproduce with `npm run build`, fix compile/type/runtime build errors.
3. **schema fails** → run Prisma commands locally, then fix `prisma/schema.prisma` formatting or compatibility issues.
4. **security fails**:
   - **Dependency Audit**: upgrade vulnerable packages and regenerate lockfile.
   - **CodeQL**: review alert details, patch risky patterns, and confirm checks pass.

### Review comment automation

This repository includes a workflow that auto-files PR review feedback as GitHub issues:

- Workflow: `.github/workflows/review-comments-automation.yml`
- Triggers:
  - `pull_request_review_comment` (inline comments)
  - `pull_request_review` (top-level review body)
- Skips:
  - Bot-authored comments from bots that are not allowlisted via `REVIEW_AUTOMATION_ALLOWED_BOTS` (default allowlist: `copilot-pull-request-reviewer[bot],copilot-swe-agent[bot]`)
  - Empty comments
  - Comments containing `[no-issue]` or `[skip-issue]`

Each auto-filed issue is labeled with:

- `needs-fix`
- `from-review-comment`
- `priority:<critical|high|medium|low>` (defaults to `medium`)
- `agent:<copilot|claude|gemini>` (derived from priority by default)

You can override routing from the review text with tokens:

- `priority: critical|high|medium|low`
- `agent: copilot|claude|gemini`

Examples:

- `priority: high agent: claude` → files issue for high priority and routes to Claude integration.
- `[skip-issue]` → comment is not converted to an issue.

#### Optional agent execution

- For `agent: copilot`, the workflow can dispatch a workflow configured in repository variable:
  - `COPILOT_CODING_WORKFLOW_ID`
- For `agent: claude` or `agent: gemini`, the workflow emits repository dispatch events:
  - `claude-review-fix-request`
  - `gemini-review-fix-request`

Connect those events to your Claude/Gemini automation workflows to perform automatic fixes.

### Rollout and hardening guidance

- Start by monitoring CI signal quality (flake rate, false positives) and tune where needed.
- Keep `cancel-in-progress` enabled to avoid duplicate runs on active branches.
- Revisit pinned action versions and dependency policy regularly.
- After observation, enforce all listed checks as required on `main`.

## How It Works

1. **Create a project** — Give it a name. This is your book, your memoir, your story.
2. **Create documents** — Name your working sections: "stories", "concepts", "structure", "stuff I haven't figured out yet".
3. **Record a session** — Tap the mic. Talk. Say everything. Don't worry about structure.
4. **The AI reads it** — Every session, the AI reads all existing material and your new transcript together. It:
   - Suggests which document this material belongs in
   - Flags threads you dropped mid-thought
   - Names what you minimized but shouldn't have
   - Detects contradictions with what you've said before
   - Generates specific questions to answer next session
5. **Review the dashboard** — See all dropped threads, open gaps, and patterns. Resolve them as you go.
6. **Generate drafts in your voice** — In any document, prompt the AI to write something. It uses your actual transcripts as a voice model.
7. **Export when ready** — Choose your export level and download a Markdown file.

## Graceful Degradation

The app works without an OpenAI API key — transcription falls back to a placeholder, AI analysis gracefully fails, but project management and manual editing all work. Set your API key to unlock the full AI features.
