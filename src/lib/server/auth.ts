import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/db';
import { forbidden, notFound, unauthorized } from '@/lib/server/errors';
import { log } from '@/lib/server/logger';

function getSessionEmail(session: unknown): string | null {
  if (!session || typeof session !== 'object' || !('user' in session)) {
    return null;
  }

  const user = session.user;
  if (!user || typeof user !== 'object' || !('email' in user)) {
    return null;
  }

  return typeof user.email === 'string' ? user.email : null;
}

export async function requireUser() {
  let session: Awaited<ReturnType<typeof getServerSession>>;
  try {
    session = await getServerSession(authOptions);
  } catch (error) {
    log('warn', 'Session resolution failed in requireUser', {
      error: error instanceof Error ? error.message : String(error),
    });
    throw unauthorized();
  }
  const email = getSessionEmail(session);

  if (!email) {
    throw unauthorized();
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (!user) {
    throw unauthorized();
  }

  return { userId: user.id, session };
}

export async function ensureProjectAccess(projectId: string, userId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      members: { where: { userId } },
    },
  });

  if (!project) {
    throw notFound('Project not found');
  }

  const isOwner = project.userId === userId;
  const isMember = project.members.length > 0;

  if (!isOwner && !isMember) {
    throw forbidden('You do not have access to this project');
  }

  return project;
}

export async function ensureProjectOwnership(projectId: string, userId: string) {
  const project = await ensureProjectAccess(projectId, userId);
  if (project.userId !== userId) {
    throw forbidden('Only project owner can delete project');
  }
  return project;
}
