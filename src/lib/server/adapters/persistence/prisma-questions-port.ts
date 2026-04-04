import { prisma } from '@/lib/db';
import { QuestionsPersistencePort, QuestionStatus } from '@/lib/server/ports/questions';

const VALID_STATUSES = ['pending', 'answered', 'dismissed'] as const;

export const prismaQuestionsPort: QuestionsPersistencePort = {
  async list(projectId: string, status?: QuestionStatus) {
    return prisma.question.findMany({
      where: {
        projectId,
        ...(status && VALID_STATUSES.includes(status) ? { status } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  async updateStatus(projectId: string, questionId: string, status: QuestionStatus) {
    const existing = await prisma.question.findFirst({ where: { id: questionId, projectId } });
    if (!existing) {
      return null;
    }

    return prisma.question.update({
      where: { id: questionId },
      data: { status },
    });
  },

  async getGenerationContext(projectId: string) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        documents: true,
        sessions: { orderBy: { createdAt: 'desc' }, take: 5 },
      },
    });

    if (!project) {
      return null;
    }

    const recentTranscriptContext = project.sessions
      .map((s) => s.transcript.slice(0, 500))
      .join('\n\n');

    const documentContext = project.documents
      .map((d) => `${d.name}: ${d.content.slice(0, 300)}`)
      .join('\n');

    return { recentTranscriptContext, documentContext };
  },

  async createGenerated(projectId: string, questions: Array<{ text: string; sessionRef?: string }>) {
    if (questions.length === 0) {
      return [];
    }

    return prisma.$transaction(
      questions.map((q) =>
        prisma.question.create({
          data: {
            projectId,
            text: q.text,
            sessionRef: q.sessionRef || null,
            status: 'pending',
          },
        })
      )
    );
  },
};
