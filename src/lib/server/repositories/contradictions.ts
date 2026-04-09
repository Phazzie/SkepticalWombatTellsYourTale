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

  updateStatus(contradictionId: string, status: string) {
    return prisma.contradiction.update({
      where: { id: contradictionId },
      data: { status },
    });
  },
};
