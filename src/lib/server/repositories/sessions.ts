import { prisma } from '@/lib/db';
import { stringifyAiAnnotations } from '@/lib/server/mappers/ai-annotations';

export const sessionsRepository = {
  listByProject(projectId: string) {
    return prisma.voiceSession.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
      include: { tangents: true },
    });
  },

  create(projectId: string, transcript: string, aiAnnotations: unknown) {
    return prisma.voiceSession.create({
      data: {
        projectId,
        transcript,
        aiAnnotations: stringifyAiAnnotations(aiAnnotations),
      },
    });
  },

  updateAnnotations(projectId: string, sessionId: string, aiAnnotations: unknown) {
    return prisma.voiceSession.updateMany({
      where: { id: sessionId, projectId },
      data: { aiAnnotations: stringifyAiAnnotations(aiAnnotations) },
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
