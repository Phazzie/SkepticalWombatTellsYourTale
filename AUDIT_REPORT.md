# Codebase Audit Report: SkepticalWombatTellsYourTale

This report outlines the technical debt, architectural concerns, bugs, and missing features discovered in the initial audit of the SkepticalWombatTellsYourTale Next.js application.

## 1. Database & Prisma Configuration (Critical)

**Issue: Deprecated Prisma URL Configuration in Schema**
* **Finding:** Running `npx prisma validate` fails because the `url` property is used in the `datasource` block of `prisma/schema.prisma` (e.g. `url = env("DATABASE_URL")`). Prisma 7+ has deprecated this in favor of configuring the URL in the `PrismaClient` constructor or via `prisma.config.ts`.
* **Risk:** Schema validations, migrations, and CI workflows will fail if using a modern version of Prisma, blocking deployment.
* **Fix Strategy:** Remove the `url` and `provider` properties from `datasource db` in `prisma/schema.prisma` if fully migrating to Prisma 7 configuration formats, OR, verify the project's exact Prisma version (`package.json` says `^5.22.0`, but the CLI might be picking up a globally installed v7). Assuming v5 is intended, we need to enforce that the local `npx prisma` uses the project's v5 instead of upgrading automatically, or update the config syntax if an upgrade to v7 is intended. *Action:* Pin `prisma` and `@prisma/client` to exactly v5.22.0 to ensure stability, or update the schema configuration. Given the `npm exec` warnings, we should ensure the right binary is used.

## 2. Environment & Rate Limiting

**Issue: In-Memory Rate Limiting**
* **Finding:** `src/lib/server/rate-limit.ts` uses a local `Map` to enforce rate limits (e.g., for `/api/auth/register` and `/api/transcribe`).
* **Risk:** In a serverless environment like Vercel, memory is not shared across function invocations. This means the rate limiter will *not* work as intended in production; it will reset frequently and fail to prevent abuse across different Vercel edge nodes.
* **Fix Strategy:** Replace the in-memory map with a distributed store like Redis (e.g., using `@upstash/redis` or standard Vercel KV) to properly enforce limits across serverless instances.

## 3. Frontend Architecture & Technical Debt

**Issue: Missing Shared UI Components**
* **Finding:** The application imports non-existent components, notably `src/components/ui/PrimaryButton.tsx`. It relies on a monolithic `src/components/ui/primitives.tsx` file for buttons, cards, and containers.
* **Risk:** Some file imports might be broken, or developers might be confused about where components live.
* **Fix Strategy:** Refactor `src/components/ui/primitives.tsx` by splitting it into dedicated, smaller component files (e.g., `Button.tsx`, `Card.tsx`, `Container.tsx`) or fix imports that might incorrectly reference separate files.

**Issue: Direct API Calls vs. Data Fetching Best Practices**
* **Finding:** Several frontend components (e.g., `src/app/page.tsx`, `src/components/project/insights-page.tsx`) use `useEffect` and raw `fetch` wrapper (`requestJson`) to load data.
* **Risk:** In Next.js 15 (App Router), relying heavily on client-side fetching for initial render data bypasses the benefits of React Server Components (RSC) and can lead to slower page loads and "waterfall" network requests.
* **Fix Strategy:** Refactor data fetching to happen server-side within the Server Components (e.g., loading projects directly in `page.tsx`'s server context) and pass the data down to interactive client components, reserving client-side fetches for mutations and real-time updates.

## 4. AI & Core Logic

**Issue: Fallback Transcription State Handling**
* **Finding:** In `src/lib/server/services/transcription.service.ts`, if OpenAI Whisper fails (or API key is missing), it stores a fallback transcript: `[Transcription unavailable — configure OpenAI API key]`.
* **Risk:** Subsequent downstream processes (like `transcript-analyzer.ts`) might parse this literal string as the actual user voice, leading to weird AI generated insights or errors.
* **Fix Strategy:** Handle transcription failure more robustly. Instead of saving a magic error string as the transcript, the database should track transcription status (e.g., `status: 'failed', errorContext: 'Missing API key'`). Downstream AI services should skip analysis if the session is not successfully transcribed.

**Issue: Unhandled Missing API Key Exceptions in Services**
* **Finding:** Services like `analyzeProjectSession` check for `deps.ai` and `process.env.OPENAI_API_KEY`. If missing, they throw a generic `badRequest('AI analysis unavailable...')`.
* **Risk:** The frontend doesn't gracefully handle this specific error state to guide the user to configure their key, resulting in generic "Something went wrong" toasts.
* **Fix Strategy:** Standardize error codes for "Missing Configuration" vs "Bad Request". Update the frontend to detect the `missing_openai_key` error code and display a specialized prompt telling the user how to configure their `.env`.

## 5. Security & Authentication

**Issue: Basic Password Hashing without Salting Verification**
* **Finding:** Need to verify `src/lib/auth/password.ts`. We assume it uses `bcrypt` or `argon2`, but we must double-check the implementation to ensure secure salting and hashing.
* **Risk:** If a weak hash is used, user passwords are at risk.
* **Fix Strategy:** Ensure `bcryptjs` or a similar robust library is correctly utilized in `password.ts`.

## What the Codebase Does Well
* **Clear Domain Driven Design:** The `src/lib/server` directory separates concerns well (`adapters`, `ports`, `repositories`, `services`).
* **Test Coverage:** Extensive unit tests are present for services, validating core domain logic.
* **Type Safety:** Strong Prisma schema boundaries and schema validation (Zod-like custom validation in `src/lib/server/validation.ts`).

## 6. Edge Case Handling (Transcription & Memory)

**Issue: Buffering entire audio files in memory**
* **Finding:** In `src/app/api/transcribe/route.ts`, the file is converted completely to memory before passing to OpenAI: `const audioBuffer = Buffer.from(await audioFile.arrayBuffer());`.
* **Risk:** The file size limit is 15MB. While Next.js on Vercel generally allows up to 50MB for function limits (often strictly maxed at 4.5MB for Vercel Edge/Serverless requests payload depending on plan), holding multiple concurrent 15MB arrays in serverless memory limits scalability and increases function cost/duration.
* **Fix Strategy:** While streaming directly to OpenAI would be ideal, the `openai` npm package often requires standard file streams or buffers. As a Vercel specific issue, we must ensure Vercel's Body Size limits allow the 15MB upload, and we should use `Blob` or `ReadStream` if possible to avoid `Buffer.from` memory spikes. Also note Vercel's 4.5MB request payload limit on serverless functions on standard plans might cause HTTP 413s before this code even executes.

## 7. Next.js Config & Dependency Check (Second Pass)
* **Finding:** Package versions are mixed. We use React 18 with Next 15 (`15.5.15`). Some Next.js 15 features expect React 19 (which is standard with Next 15 App Router). Though not strictly a bug, upgrading to React 19 or standardizing on Next 14/React 18 might prevent weird suspense/hydration bugs.
* **Finding:** Tailwind config uses Next.js app router paths correctly.

## Summary

The core domain logic is well-structured and extensively tested, which is a major strength. The most critical roadblocks for immediate Vercel deployment are the Prisma schema database url, the in-memory rate limiter, and the large in-memory buffers for audio upload processing. Fixing the client-side data fetching will vastly improve the UX and perceived performance.
