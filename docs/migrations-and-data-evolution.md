# Migration and Data Evolution Guardrails

## Scope
This project evolves rapidly; schema and API contract changes must be explicit and reversible.

## Required process for schema changes
1. Update `prisma/schema.prisma` and all impacted API/service logic in the same PR.
2. Generate a migration locally (requires a running PostgreSQL instance):
   ```bash
   npm run db:migrate:dev -- --name <describe-the-change>
   ```
   This creates a new migration file in `prisma/migrations/`. Commit the generated migration file alongside the schema change.
3. Run required repository validation:
   - `npm run lint`
   - `npm run build`
4. Preserve backward compatibility for existing request/response contracts unless the PR explicitly includes coordinated client updates.

## Migration commands

| Command | Purpose | When to use |
| --- | --- | --- |
| `npm run db:migrate:dev` | Create new migration files from schema changes | Local development |
| `npm run db:migrate:deploy` | Apply pending migrations to the target database | Production deployments |
| `npm run db:bootstrap` | Quick local setup using `db push` (no migration files generated) | Initial local setup only |

**Important:** Always run `npm run db:migrate:deploy` before starting the server on a fresh production database or after a deployment that includes schema changes.

## Why `migrate deploy` instead of `db push` in production

- `db push` is a development tool. It does not generate migration files and can silently drop/recreate columns.
- `migrate deploy` applies only the committed, reviewed migration files — providing an audit trail and safe rollback path.
- CI enforces that `prisma/migrations/` is in sync with `prisma/schema.prisma` (fails if a schema change has no corresponding migration).

## JSON-string fields
- Prisma uses `String` for JSON-like fields such as `aiAnnotations` and `sessionRefs`.
- All parse/stringify behavior must go through mapper utilities in `src/lib/server/mappers/*`.
- Never parse/stringify these fields ad-hoc in route handlers.

## Error and route consistency
- Route handlers should stay thin and use shared `handleRoute` behavior.
- Domain/validation errors should map to explicit HTTP status and `{ error: string }` payloads.
- Prefer schema-based validation (`src/lib/server/schema.ts`) for request parsing.

## AI-heavy workflow safety
- AI-heavy endpoints must enforce auth, project ownership/access checks, and rate limiting.
- Multi-write AI flows should be transactional to avoid partial persistence.
