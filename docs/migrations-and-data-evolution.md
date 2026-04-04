# Migration and Data Evolution Guardrails

## Scope
This project evolves rapidly; schema and API contract changes must be explicit and reversible.

## Required process for schema changes
1. Update `prisma/schema.prisma` and all impacted API/service logic in the same PR.
2. Run local schema sync with SQLite:
   - `DATABASE_URL='file:./dev.db' npx prisma db push`
3. Run required repository validation:
   - `npm run lint`
   - `npm run build`
4. Preserve backward compatibility for existing request/response contracts unless the PR explicitly includes coordinated client updates.

## JSON-string fields
- SQLite/Prisma uses `String` for JSON-like fields such as `aiAnnotations` and `sessionRefs`.
- All parse/stringify behavior must go through mapper utilities in `src/lib/server/mappers/*`.
- Never parse/stringify these fields ad-hoc in route handlers.

## Error and route consistency
- Route handlers should stay thin and use shared `handleRoute` behavior.
- Domain/validation errors should map to explicit HTTP status and `{ error: string }` payloads.
- Prefer schema-based validation (`src/lib/server/schema.ts`) for request parsing.

## AI-heavy workflow safety
- AI-heavy endpoints must enforce auth, project ownership/access checks, and rate limiting.
- Multi-write AI flows should be transactional to avoid partial persistence.
