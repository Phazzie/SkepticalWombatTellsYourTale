import { prisma } from '@/lib/db';

export const conceptsRepository = {
  listByProject(projectId: string) {
    return prisma.concept.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });
  },

  findInProject(conceptId: string, projectId: string) {
    return prisma.concept.findFirst({ where: { id: conceptId, projectId } });
  },

  update(conceptId: string, data: { approved?: boolean; status?: string }) {
    return prisma.concept.update({
      where: { id: conceptId },
      data,
    });
  },
};
