import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; tangentId: string }> }
) {
  const { tangentId } = await params;
  const data = await request.json();
  const tangent = await prisma.tangent.update({
    where: { id: tangentId },
    data,
  });
  return NextResponse.json(tangent);
}
