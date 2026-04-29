# AGENTS.md (prisma)

This file extends `/AGENTS.md`.

- Follow `docs/migrations-and-data-evolution.md` for schema changes.
- Any schema change must include application updates in the same PR.
- Validate and format Prisma schema in the local workflow (`npx prisma validate`).
- Avoid unsupported SQLite features.
- **Never use `prisma db push` outside of local dev bootstrap.**
  `npm run db:bootstrap` uses `prisma db push` which bypasses migration history.
  Running it against a production `DATABASE_URL` is destructive and unrecoverable.
  For development use `prisma migrate dev`; for production use `prisma migrate deploy`.
