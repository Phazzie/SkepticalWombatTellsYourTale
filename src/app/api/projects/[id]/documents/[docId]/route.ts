import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string; docId: string } }
) {
  const data = await request.json();
  const document = await prisma.document.update({
    where: { id: params.docId },
    data,
  });
  return NextResponse.json(document);
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string; docId: string } }
) {
  await prisma.document.delete({ where: { id: params.docId } });
  return NextResponse.json({ success: true });
}
