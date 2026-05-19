import { prisma } from '@/lib/db';
import { SearchResultItem } from '@/lib/server/ports/search';

export const searchRepository = {
  async searchProject(projectId: string, query: string): Promise<SearchResultItem[]> {
    const contains = { contains: query, mode: 'insensitive' as const };

    const [documents, sessions, questions, concepts, gaps, tangents, contradictions] = await Promise.all([
      prisma.document.findMany({
        where: { projectId, OR: [{ name: contains }, { content: contains }, { type: contains }] },
        orderBy: { updatedAt: 'desc' },
        take: 30,
      }),
      prisma.voiceSession.findMany({
        where: { projectId, transcript: contains },
        orderBy: { createdAt: 'desc' },
        take: 30,
      }),
      prisma.question.findMany({
        where: { projectId, text: contains },
        orderBy: { createdAt: 'desc' },
        take: 30,
      }),
      prisma.concept.findMany({
        where: { projectId, OR: [{ name: contains }, { definition: contains }] },
        orderBy: { updatedAt: 'desc' },
        take: 30,
      }),
      prisma.gap.findMany({
        where: { projectId, OR: [{ description: contains }, { documentRef: contains }] },
        orderBy: { createdAt: 'desc' },
        take: 30,
      }),
      prisma.tangent.findMany({
        where: { projectId, OR: [{ thread: contains }, { context: contains }] },
        orderBy: { createdAt: 'desc' },
        take: 30,
      }),
      prisma.contradiction.findMany({
        where: {
          projectId,
          OR: [{ description: contains }, { existing: contains }, { new: contains }],
        },
        orderBy: { createdAt: 'desc' },
        take: 30,
      }),
    ]);

    return [
      ...documents.map((d) => ({
        kind: 'document' as const,
        id: d.id,
        title: d.name,
        snippet: d.content.slice(0, 180),
        createdAt: d.createdAt,
      })),
      ...sessions.map((s) => ({
        kind: 'session' as const,
        id: s.id,
        title: `Session ${s.id.slice(0, 8)}`,
        snippet: s.transcript.slice(0, 180),
        createdAt: s.createdAt,
      })),
      ...questions.map((qRow) => ({
        kind: 'question' as const,
        id: qRow.id,
        title: qRow.text,
        snippet: qRow.status,
        createdAt: qRow.createdAt,
      })),
      ...concepts.map((c) => ({
        kind: 'concept' as const,
        id: c.id,
        title: c.name,
        snippet: c.definition,
        createdAt: c.createdAt,
      })),
      ...gaps.map((g) => ({
        kind: 'gap' as const,
        id: g.id,
        title: g.description,
        snippet: g.documentRef || '',
        createdAt: g.createdAt,
      })),
      ...tangents.map((t) => ({
        kind: 'tangent' as const,
        id: t.id,
        title: t.thread,
        snippet: t.context,
        createdAt: t.createdAt,
      })),
      ...contradictions.map((c) => ({
        kind: 'contradiction' as const,
        id: c.id,
        title: c.description,
        snippet: `${c.existing} ⇄ ${c.new}`.slice(0, 180),
        createdAt: c.createdAt,
      })),
    ];
  },
};
