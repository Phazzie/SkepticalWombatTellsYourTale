import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import {
  asOptionalString,
  readJsonObjectBody,
  RequestValidationError,
} from '@/lib/api-contract';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; docId: string }> }
) {
  const { id, docId } = await params;
  try {
    const body = await readJsonObjectBody(request);
    const name = asOptionalString(body.name, 'name');
    const content = asOptionalString(body.content, 'content');
    const type = asOptionalString(body.type, 'type');
    const existing = await prisma.document.findFirst({ where: { id: docId, projectId: id } });
    if (!existing) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }
    const document = await prisma.document.update({
      where: { id: docId },
      data: {
        ...(name !== undefined && { name }),
        ...(content !== undefined && { content }),
        ...(type !== undefined && { type }),
      },
    });
    return NextResponse.json(document);
  } catch (error) {
    if (error instanceof RequestValidationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    throw error;
  }
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
