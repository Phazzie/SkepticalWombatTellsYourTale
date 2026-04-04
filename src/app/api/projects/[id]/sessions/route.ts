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
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const sessions = await prisma.session.findMany({
    where: { projectId: id },
    orderBy: { createdAt: 'desc' },
    include: { tangents: true, promptedBy: true },
  });
  const parsed = sessions.map((s) => ({
    ...s,
    aiAnnotations: safeParseJson(s.aiAnnotations, []),
  }));
  return NextResponse.json(parsed);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const data = await request.json();
  const session = await prisma.session.create({
    data: {
      projectId: id,
      transcript: data.transcript || '',
      aiAnnotations: JSON.stringify(data.aiAnnotations || []),
    },
  });
  return NextResponse.json(session);
}
