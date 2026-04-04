import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/db';
import { forbidden, notFound, unauthorized } from '@/lib/server/errors';

export async function requireUser() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    throw unauthorized();
  }

  return { userId, session };
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
