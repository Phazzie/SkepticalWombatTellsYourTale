import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string; gapId: string } }
) {
  const data = await request.json();
  const gap = await prisma.gap.update({
    where: { id: params.gapId },
    data,
  });
  return NextResponse.json(gap);
}
