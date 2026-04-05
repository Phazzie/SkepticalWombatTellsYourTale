import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/db';
import { forbidden, notFound, unauthorized } from '@/lib/server/errors';

export async function requireUser() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;

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
