import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; docId: string }> }
) {
  const { docId } = await params;
  const data = await request.json();
  const document = await prisma.document.update({
    where: { id: docId },
    data,
  });
  return NextResponse.json(document);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; docId: string }> }
) {
  const { docId } = await params;
  await prisma.document.delete({ where: { id: docId } });
  return NextResponse.json({ success: true });
}
