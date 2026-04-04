import { prisma } from '@/lib/db';
import { stringifySessionRefs } from '@/lib/server/mappers/session-refs';

export const analysisRepository = {
  async createTangents(projectId: string, sessionId: string, tangents: Array<{ thread: string; context: string }>) {
    if (tangents.length === 0) return;
    await prisma.tangent.createMany({
      data: tangents.map((t) => ({
        projectId,
        sessionId,
        thread: t.thread,
        context: t.context || '',
        status: 'pending',
      })),
    });
  },

  async createPatterns(projectId: string, patterns: Array<{ description: string; sessionRefs: string[] }>) {
    if (patterns.length === 0) return;
    await prisma.pattern.createMany({
      data: patterns.map((p) => ({
        projectId,
        description: p.description,
        sessionRefs: stringifySessionRefs(p.sessionRefs),
        acknowledged: false,
      })),
    });
  },

  async createGaps(projectId: string, gaps: Array<{ description: string; documentRef?: string }>) {
    if (gaps.length === 0) return;
    await prisma.gap.createMany({
      data: gaps.map((g) => ({
        projectId,
        description: g.description,
        documentRef: g.documentRef || null,
        resolved: false,
      })),
    });
  },

  updateTangentStatus(projectId: string, tangentId: string, status: 'pending' | 'resolved' | 'dismissed') {
    return prisma.tangent.updateMany({
      where: { id: tangentId, projectId },
      data: { status },
    });
  },

  updateGapResolved(projectId: string, gapId: string, resolved: boolean) {
    return prisma.gap.updateMany({
      where: { id: gapId, projectId },
      data: { resolved },
    });
  },
};
