import { prisma } from '@/lib/db';

export const contradictionsRepository = {
  listByProject(projectId: string, status?: string) {
    return prisma.contradiction.findMany({
      where: {
        projectId,
        ...(status ? { status } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  findInProject(contradictionId: string, projectId: string) {
    return prisma.contradiction.findFirst({ where: { id: contradictionId, projectId } });
  },

  async updateStatus(contradictionId: string, projectId: string, status: string) {
    const result = await prisma.contradiction.updateMany({
      where: { id: contradictionId, projectId },
      data: { status },
    });

    if (result.count !== 1) {
      throw new Error('Contradiction not found in project');
    }

    return prisma.contradiction.findFirst({
      where: { id: contradictionId, projectId },
    });
  },
};
