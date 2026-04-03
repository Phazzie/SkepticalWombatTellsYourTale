import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const documents = await prisma.document.findMany({
    where: { projectId: id },
    orderBy: { createdAt: 'asc' },
  });
  return NextResponse.json(documents);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { name, type } = await request.json();
  const document = await prisma.document.create({
    data: { projectId: id, name, type: type || 'general' },
  });
  return NextResponse.json(document);
}
