import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const sessions = await prisma.session.findMany({
    where: { projectId: params.id },
    orderBy: { createdAt: 'desc' },
    include: { tangents: true },
  });
  return NextResponse.json(sessions);
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const data = await request.json();
  const session = await prisma.session.create({
    data: {
      projectId: params.id,
      transcript: data.transcript || '',
      aiAnnotations: JSON.stringify(data.aiAnnotations || []),
    },
  });
  return NextResponse.json(session);
}
