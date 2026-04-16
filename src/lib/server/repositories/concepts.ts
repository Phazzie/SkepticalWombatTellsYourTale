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

  async update(
    conceptId: string,
    projectId: string,
    data: { approved?: boolean; status?: string }
  ) {
    const result = await prisma.concept.updateMany({
      where: { id: conceptId, projectId },
      data,
    });

    if (result.count !== 1) {
      throw new Error('Concept not found in project');
    }

    return prisma.concept.findFirst({
      where: { id: conceptId, projectId },
    });
  },
};
