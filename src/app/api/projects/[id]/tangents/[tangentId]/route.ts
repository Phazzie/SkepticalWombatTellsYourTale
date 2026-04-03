import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string; tangentId: string } }
) {
  const data = await request.json();
  const tangent = await prisma.tangent.update({
    where: { id: params.tangentId },
    data,
  });
  return NextResponse.json(tangent);
}
