import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import {
  asRequiredString,
  readJsonObjectBody,
  RequestValidationError,
} from '@/lib/api-contract';

const VALID_STATUSES = ['pending', 'resolved', 'dismissed'] as const;
type TangentStatus = typeof VALID_STATUSES[number];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; tangentId: string }> }
) {
  const { id, tangentId } = await params;
  let status = '';
  try {
    const body = await readJsonObjectBody(request);
    status = asRequiredString(body.status, 'status');
  } catch (error) {
    if (error instanceof RequestValidationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    throw error;
  }

  if (!status || !VALID_STATUSES.includes(status as TangentStatus)) {
    return NextResponse.json(
      { error: `Invalid payload. \`status\` must be one of: ${VALID_STATUSES.join(', ')}` },
      { status: 400 }
    );
  }

  const existing = await prisma.tangent.findFirst({ where: { id: tangentId, projectId: id } });
  if (!existing) {
    return NextResponse.json({ error: 'Tangent not found' }, { status: 404 });
  }

  const tangent = await prisma.tangent.update({
    where: { id: tangentId },
    data: { status: status as TangentStatus },
  });
  return NextResponse.json(tangent);
}
