import { ensureProjectAccess } from '@/lib/server/auth';

export async function requireProjectAccess(projectId: string, userId: string) {
  await ensureProjectAccess(projectId, userId);
}
