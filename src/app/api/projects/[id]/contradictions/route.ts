import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const VALID_STATUSES = ['open', 'explored', 'dismissed'] as const;
type ContradictionStatus = typeof VALID_STATUSES[number];

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const url = new URL(request.url);
  const status = url.searchParams.get('status');

  const contradictions = await prisma.contradiction.findMany({
    where: {
      projectId: id,
      ...(status && VALID_STATUSES.includes(status as ContradictionStatus)
        ? { status: status as ContradictionStatus }
        : {}),
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(contradictions);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { contradictionId, status } = body as { contradictionId?: string; status?: string };

  if (!contradictionId || !status || !VALID_STATUSES.includes(status as ContradictionStatus)) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const existing = await prisma.contradiction.findFirst({ where: { id: contradictionId, projectId: id } });
  if (!existing) return NextResponse.json({ error: 'Contradiction not found' }, { status: 404 });

  const updated = await prisma.contradiction.update({
    where: { id: contradictionId },
    data: { status: status as ContradictionStatus },
  });
  return NextResponse.json(updated);
}

