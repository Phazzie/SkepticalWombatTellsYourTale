import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const url = new URL(request.url);
  const q = url.searchParams.get('q')?.trim();

  if (!q) return NextResponse.json({ query: '', results: [] });

  const contains = { contains: q, mode: 'insensitive' as const };

  const [documents, sessions, questions, concepts, gaps, tangents, contradictions] = await Promise.all([
    prisma.document.findMany({
      where: { projectId: id, OR: [{ name: contains }, { content: contains }, { type: contains }] },
      orderBy: { updatedAt: 'desc' },
      take: 30,
    }),
    prisma.session.findMany({
      where: { projectId: id, transcript: contains },
      orderBy: { createdAt: 'desc' },
      take: 30,
    }),
    prisma.question.findMany({
      where: { projectId: id, text: contains },
      orderBy: { createdAt: 'desc' },
      take: 30,
    }),
    prisma.concept.findMany({
      where: { projectId: id, OR: [{ name: contains }, { definition: contains }] },
      orderBy: { updatedAt: 'desc' },
      take: 30,
    }),
    prisma.gap.findMany({
      where: { projectId: id, OR: [{ description: contains }, { documentRef: contains }] },
      orderBy: { createdAt: 'desc' },
      take: 30,
    }),
    prisma.tangent.findMany({
      where: { projectId: id, OR: [{ thread: contains }, { context: contains }] },
      orderBy: { createdAt: 'desc' },
      take: 30,
    }),
    prisma.contradiction.findMany({
      where: {
        projectId: id,
        OR: [{ description: contains }, { existing: contains }, { new: contains }],
      },
      orderBy: { createdAt: 'desc' },
      take: 30,
    }),
  ]);

  const results = [
    ...documents.map((d) => ({ kind: 'document', id: d.id, title: d.name, snippet: d.content.slice(0, 180), createdAt: d.createdAt })),
    ...sessions.map((s) => ({ kind: 'session', id: s.id, title: `Session ${s.id.slice(0, 8)}`, snippet: s.transcript.slice(0, 180), createdAt: s.createdAt })),
    ...questions.map((qRow) => ({ kind: 'question', id: qRow.id, title: qRow.text, snippet: qRow.status, createdAt: qRow.createdAt })),
    ...concepts.map((c) => ({ kind: 'concept', id: c.id, title: c.name, snippet: c.definition, createdAt: c.createdAt })),
    ...gaps.map((g) => ({ kind: 'gap', id: g.id, title: g.description, snippet: g.documentRef || '', createdAt: g.createdAt })),
    ...tangents.map((t) => ({ kind: 'tangent', id: t.id, title: t.thread, snippet: t.context, createdAt: t.createdAt })),
    ...contradictions.map((c) => ({ kind: 'contradiction', id: c.id, title: c.description, snippet: `${c.existing} ⇄ ${c.new}`.slice(0, 180), createdAt: c.createdAt })),
  ].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));

  return NextResponse.json({ query: q, results });
}

