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

- **Framework**: Next.js 14 (App Router) + TypeScript
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
