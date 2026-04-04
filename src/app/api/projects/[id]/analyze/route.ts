import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { analyzeTranscript } from '@/lib/openai';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { sessionId, transcript } = await request.json();

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      documents: true,
      sessions: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  });

  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const projectContext = `Project: "${project.name}"\n${project.description || ''}`;
  const sessionHistory = project.sessions
    .filter((s) => s.id !== sessionId)
    .map((s) => `Session ${s.id.slice(0, 8)} (${s.createdAt.toISOString().split('T')[0]}): ${s.transcript.slice(0, 300)}`)
    .join('\n\n');

  try {
    const analysis = await analyzeTranscript(
      transcript,
      projectContext,
      sessionHistory,
      project.documents.map((d) => ({ id: d.id, name: d.name, content: d.content })),
      sessionId
    );

    if (analysis.tangents && analysis.tangents.length > 0) {
      await prisma.tangent.createMany({
        data: analysis.tangents.map((t) => ({
          projectId: id,
          sessionId,
          thread: t.thread,
          context: t.context || '',
          status: 'pending',
        })),
      });
    }

    if (analysis.patterns && analysis.patterns.length > 0) {
      await prisma.pattern.createMany({
        data: analysis.patterns.map((p) => ({
          projectId: id,
          description: p.description,
          sessionRefs: JSON.stringify(p.sessionRefs),
          acknowledged: false,
        })),
      });
    }

    if (analysis.gaps && analysis.gaps.length > 0) {
      await prisma.gap.createMany({
        data: analysis.gaps.map((g) => ({
          projectId: id,
          description: g.description,
          documentRef: g.documentRef || null,
          resolved: false,
        })),
      });
    }

    if (analysis.annotations && sessionId) {
      await prisma.session.updateMany({
        where: { id: sessionId, projectId: id },
        data: { aiAnnotations: JSON.stringify(analysis.annotations) },
      });
    }

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}
