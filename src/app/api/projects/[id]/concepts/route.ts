import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const concepts = await prisma.concept.findMany({
    where: { projectId: id },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(concepts);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { conceptId, approved, status } = body as {
    conceptId?: string;
    approved?: boolean;
    status?: string;
  };

  if (!conceptId) {
    return NextResponse.json({ error: 'Missing conceptId' }, { status: 400 });
  }

  const existing = await prisma.concept.findFirst({ where: { id: conceptId, projectId: id } });
  if (!existing) return NextResponse.json({ error: 'Concept not found' }, { status: 404 });

  const updated = await prisma.concept.update({
    where: { id: conceptId },
    data: {
      ...(typeof approved === 'boolean' ? { approved } : {}),
      ...(typeof status === 'string' ? { status } : {}),
    },
  });
  return NextResponse.json(updated);
}

