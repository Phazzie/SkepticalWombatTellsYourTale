import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import {
  asOptionalString,
  asRequiredString,
  readJsonObjectBody,
  RequestValidationError,
} from '@/lib/api-contract';

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
  try {
    const body = await readJsonObjectBody(request);
    const name = asRequiredString(body.name, 'name');
    const type = asOptionalString(body.type, 'type') ?? 'general';
    const document = await prisma.document.create({
      data: { projectId: id, name, type },
    });
    return NextResponse.json(document);
  } catch (error) {
    if (error instanceof RequestValidationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    throw error;
  }
}
