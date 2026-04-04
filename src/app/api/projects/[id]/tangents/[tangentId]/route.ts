import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const VALID_STATUSES = ['pending', 'resolved', 'dismissed'] as const;
type TangentStatus = typeof VALID_STATUSES[number];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; tangentId: string }> }
) {
  const { id, tangentId } = await params;
  const body = await request.json();
  const { status } = body as { status?: unknown };

  if (!status || !VALID_STATUSES.includes(status as TangentStatus)) {
    return NextResponse.json(
      { error: `Invalid payload. \`status\` must be one of: ${VALID_STATUSES.join(', ')}` },
      { status: 400 }
    );
  }

  const existing = await prisma.tangent.findFirst({ where: { id: tangentId, projectId: id } });
  if (!existing) {
    return NextResponse.json({ error: 'Tangent not found' }, { status: 404 });
  }

  const tangent = await prisma.tangent.update({
    where: { id: tangentId },
    data: { status: status as TangentStatus },
  });
  return NextResponse.json(tangent);
}
