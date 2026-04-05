import { ensureProjectAccess } from '@/lib/server/auth';

export async function requireProjectAccess(
  projectId: string,
  userId: string,
  deps: {
    ensureProjectAccess?: (projectId: string, userId: string) => Promise<void>;
  } = {}
) {
  const ensureAccess = deps.ensureProjectAccess || ensureProjectAccess;
  await ensureAccess(projectId, userId);
}
