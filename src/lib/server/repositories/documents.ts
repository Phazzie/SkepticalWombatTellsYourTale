import { prisma } from '@/lib/db';

export const documentsRepository = {
  listByProject(projectId: string) {
    return prisma.document.findMany({
      where: { projectId },
      orderBy: { createdAt: 'asc' },
    });
  },

  create(projectId: string, name: string, type: string) {
    return prisma.document.create({ data: { projectId, name, type } });
  },

  findByIdInProject(docId: string, projectId: string) {
    return prisma.document.findFirst({ where: { id: docId, projectId } });
  },

  update(docId: string, data: { name?: string; content?: string; type?: string }) {
    return prisma.document.update({ where: { id: docId }, data });
  },

  delete(docId: string, projectId: string) {
    return prisma.document.deleteMany({ where: { id: docId, projectId } });
  },
};
