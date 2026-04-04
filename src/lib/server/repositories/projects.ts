import { prisma } from '@/lib/db';

export const projectsRepository = {
  async claimUnownedProjects(userId: string) {
    const ownerCount = await prisma.project.count({ where: { userId } });
    if (ownerCount > 0) return;

    await prisma.project.updateMany({
      where: { userId: null },
      data: { userId },
    });
  },

  listForUser(userId: string) {
    return prisma.project.findMany({
      where: {
        OR: [{ userId }, { members: { some: { userId } } }],
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  createForUser(userId: string, name: string, description: string | null) {
    return prisma.project.create({
      data: {
        userId,
        name,
        description,
      },
    });
  },

  updateProject(id: string, data: { name?: string; description?: string | null }) {
    return prisma.project.update({ where: { id }, data });
  },

  deleteProject(id: string) {
    return prisma.project.delete({ where: { id } });
  },

  getProjectWithAll(id: string) {
    return prisma.project.findUnique({
      where: { id },
      include: {
        documents: true,
        sessions: { orderBy: { createdAt: 'desc' } },
        tangents: { orderBy: { createdAt: 'desc' } },
        patterns: { orderBy: { createdAt: 'desc' } },
        gaps: { orderBy: { createdAt: 'desc' } },
      },
    });
  },
};
