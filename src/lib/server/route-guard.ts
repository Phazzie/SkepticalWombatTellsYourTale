import { requireUser } from '@/lib/server/auth';
import { requireProjectAccess } from '@/lib/server/services/project-access';

/**
 * Shared prelude for all /api/projects/[id]/** route handlers.
 * Resolves the authenticated user and verifies project membership in one call,
 * eliminating the repeated requireUser + params + requireProjectAccess boilerplate.
 */
export async function requireProjectHandler<T extends { id: string }>(
  params: Promise<T>
): Promise<{ userId: string; projectId: string } & Omit<T, 'id'>> {
  const [{ userId }, resolvedParams] = await Promise.all([requireUser(), params]);
  const { id: projectId, ...rest } = resolvedParams;
  await requireProjectAccess(projectId, userId);
  return { userId, projectId, ...(rest as Omit<T, 'id'>) };
}
