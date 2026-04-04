import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

function safeParseJson<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const url = new URL(request.url);
  const includeAll = url.searchParams.get('include') === 'all';

  if (includeAll) {
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        documents: true,
        sessions: { orderBy: { createdAt: 'desc' } },
        tangents: { orderBy: { createdAt: 'desc' } },
        patterns: { orderBy: { createdAt: 'desc' } },
        gaps: { orderBy: { createdAt: 'desc' } },
        questions: { orderBy: { createdAt: 'desc' } },
        concepts: { orderBy: { createdAt: 'desc' } },
        contradictions: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({
      ...project,
      sessions: project.sessions.map((s) => ({
        ...s,
        aiAnnotations: safeParseJson(s.aiAnnotations, []),
      })),
      patterns: project.patterns.map((p) => ({
        ...p,
        sessionRefs: safeParseJson(p.sessionRefs, []),
      })),
    });
  }

  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(project);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { name, description } = body as { name?: string; description?: string };
  const project = await prisma.project.update({
    where: { id },
    data: {
      ...(typeof name === 'string' && { name }),
      ...(description !== undefined && { description }),
    },
  });
  return NextResponse.json(project);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.project.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
