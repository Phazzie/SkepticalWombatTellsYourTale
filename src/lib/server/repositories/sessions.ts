import { prisma } from '@/lib/db';

export const sessionsRepository = {
  listByProject(projectId: string) {
    return prisma.voiceSession.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
      include: { tangents: true },
    });
  },

  create(projectId: string, transcript: string, aiAnnotations: string) {
    return prisma.voiceSession.create({
      data: {
        projectId,
        transcript,
        aiAnnotations,
      },
    });
  },

  updateAnnotations(projectId: string, sessionId: string, aiAnnotations: string) {
    return prisma.voiceSession.updateMany({
      where: { id: sessionId, projectId },
      data: { aiAnnotations },
    });
  },

  listRecentByProject(projectId: string, take: number) {
    return prisma.voiceSession.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
      take,
    });
  },
};
