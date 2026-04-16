import { prisma } from '@/lib/db';

type ExportProjectData = Awaited<ReturnType<typeof exportRepository.getProjectForExport>>;
export type { ExportProjectData };

export const exportRepository = {
  getProjectForExport(projectId: string) {
    return prisma.project.findUnique({
      where: { id: projectId },
      include: {
        documents: true,
        sessions: { orderBy: { createdAt: 'asc' } },
        tangents: true,
        patterns: true,
        gaps: true,
      },
    });
  },
};
