import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; docId: string }> }
) {
  const { id, docId } = await params;
  const body = await request.json();
  const { name, content, type } = body as { name?: string; content?: string; type?: string };
  const existing = await prisma.document.findFirst({ where: { id: docId, projectId: id } });
  if (!existing) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 });
  }
  const document = await prisma.document.update({
    where: { id: docId },
    data: {
      ...(typeof name === 'string' && { name }),
      ...(typeof content === 'string' && { content }),
      ...(typeof type === 'string' && { type }),
    },
  });
  return NextResponse.json(document);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; docId: string }> }
) {
  const { id, docId } = await params;
  const result = await prisma.document.deleteMany({
    where: { id: docId, projectId: id },
  });
  if (result.count === 0) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
