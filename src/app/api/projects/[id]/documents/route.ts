import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const documents = await prisma.document.findMany({
    where: { projectId: params.id },
    orderBy: { createdAt: 'asc' },
  });
  return NextResponse.json(documents);
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { name, type } = await request.json();
  const document = await prisma.document.create({
    data: { projectId: params.id, name, type: type || 'general' },
  });
  return NextResponse.json(document);
}
