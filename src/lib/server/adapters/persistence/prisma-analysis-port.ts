import { prisma } from '@/lib/db';
import { AnalysisPersistencePort } from '@/lib/server/ports/analysis';
import { AnalysisResult } from '@/lib/types';
import { aiWorkflowsRepository } from '@/lib/server/repositories/ai-workflows';

export const prismaAnalysisPort: AnalysisPersistencePort = {
  async getProjectAnalysisContext(projectId: string, sessionId: string) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        documents: true,
        concepts: true,
        contradictions: {
          where: { status: 'open' },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        sessions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!project) {
      return null;
    }

    const conceptContext = project.concepts
      .map((c) => `${c.name}: ${c.definition} [${c.status}]`)
      .join('\n');

    const contradictionContext = project.contradictions
      .map((c) => `${c.description}\nExisting: ${c.existing}\nNew: ${c.new}`)
      .join('\n\n');

    const sessionHistory = project.sessions
      .filter((s) => s.id !== sessionId)
      .map((s) => `Session ${s.id.slice(0, 8)} (${s.createdAt.toISOString().split('T')[0]}): ${s.transcript.slice(0, 300)}`)
      .join('\n\n');

    return {
      projectName: project.name,
      projectDescription: project.description,
      documents: project.documents.map((d) => ({ id: d.id, name: d.name, content: d.content })),
      conceptContext,
      contradictionContext,
      sessionHistory,
    };
  },

  async persistAnalysisResult(projectId: string, sessionId: string, analysis: AnalysisResult) {
    const projectDocuments = await prisma.document.findMany({
      where: { projectId },
      select: { id: true, name: true },
    });

    await aiWorkflowsRepository.persistAnalysisWrites(projectId, sessionId, analysis, projectDocuments);
  },
};
