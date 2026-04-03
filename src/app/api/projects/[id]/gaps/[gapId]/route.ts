import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; gapId: string }> }
) {
  const { gapId } = await params;
  const data = await request.json();
  const gap = await prisma.gap.update({
    where: { id: gapId },
    data,
  });
  return NextResponse.json(gap);
}
