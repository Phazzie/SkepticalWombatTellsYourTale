# CLAUDE.md (prisma)

Extends `/CLAUDE.md`. Follow root rules first.

Scope: Prisma schema, migrations, and seed files.

- Never use `prisma db push` outside of local dev bootstrap (`npm run db:bootstrap`).
  Use `prisma migrate dev` for development and `prisma migrate deploy` for production.
  Running `db:bootstrap` against a production `DATABASE_URL` destroys migration history.
- Every schema change must be accompanied by a migration and corresponding application
  updates in the same commit. Do not leave schema and app out of sync.
- Run `npx prisma validate` after every schema change before committing.
- Avoid SQLite-unsupported features (e.g., enums as native DB types, certain index types).
- Follow `docs/migrations-and-data-evolution.md` for data migration patterns.
