import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import {
  asBoolean,
  readJsonObjectBody,
  RequestValidationError,
} from '@/lib/api-contract';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; gapId: string }> }
) {
  const { id, gapId } = await params;
  let resolved = false;
  try {
    const body = await readJsonObjectBody(request);
    resolved = asBoolean(body.resolved, 'resolved');
  } catch (error) {
    if (error instanceof RequestValidationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    throw error;
  }

  const existing = await prisma.gap.findFirst({ where: { id: gapId, projectId: id } });
  if (!existing) {
    return NextResponse.json({ error: 'Gap not found' }, { status: 404 });
  }

  const gap = await prisma.gap.update({ where: { id: gapId }, data: { resolved } });
  return NextResponse.json(gap);
}
