import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; gapId: string }> }
) {
  const { id, gapId } = await params;
  const body = await request.json();
  const { resolved } = body as { resolved?: unknown };

  if (typeof resolved !== 'boolean') {
    return NextResponse.json(
      { error: 'Invalid payload. Only `resolved` boolean is allowed.' },
      { status: 400 }
    );
  }

  const existing = await prisma.gap.findFirst({ where: { id: gapId, projectId: id } });
  if (!existing) {
    return NextResponse.json({ error: 'Gap not found' }, { status: 404 });
  }

  const gap = await prisma.gap.update({ where: { id: gapId }, data: { resolved } });
  return NextResponse.json(gap);
}
