# Autonomous Agent Execution (Repository-Specific)

This repository provides a machine-readable contract at:

- `/home/runner/work/SkepticalWombatTellsYourTale/SkepticalWombatTellsYourTale/agent.exec.contract.json`

Use that file as source of truth for autonomous execution behavior.

## Required command flow

1. Preflight:
   - `npm ci`
   - `npm run db:bootstrap`
   - `npm run lint`
   - `npm run build`
2. Implementation in small, coherent edits.
3. Post-change verification:
   - `npm run lint`
   - `npm run build`
   - `npm run test`
   - `npm run security:audit`

## Policy highlights

- Validate API boundaries for request and response shapes.
- Degrade gracefully on malformed AI JSON responses.
- Stop and ask for human input when requirements conflict or repeated validation failures occur.
- Keep commit boundaries small and rollback on regressions.
- Produce structured run artifacts under `artifacts/agent-runs`.
