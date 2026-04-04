import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import {
  asOptionalString,
  readJsonObjectBody,
  RequestValidationError,
  safeParseJson,
} from '@/lib/api-contract';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const sessions = await prisma.session.findMany({
    where: { projectId: id },
    orderBy: { createdAt: 'desc' },
    include: { tangents: true },
  });
  const parsed = sessions.map((s) => ({
    ...s,
    aiAnnotations: safeParseJson(s.aiAnnotations, []),
  }));
  return NextResponse.json(parsed);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const data = await readJsonObjectBody(request);
    const transcript = asOptionalString(data.transcript, 'transcript') ?? '';
    const aiAnnotationsRaw = data.aiAnnotations;
    const aiAnnotations =
      Array.isArray(aiAnnotationsRaw) && aiAnnotationsRaw.every((a) => !!a && typeof a === 'object')
        ? aiAnnotationsRaw
        : [];

    const session = await prisma.session.create({
      data: {
        projectId: id,
        transcript,
        aiAnnotations: JSON.stringify(aiAnnotations),
      },
    });
    return NextResponse.json(session);
  } catch (error) {
    if (error instanceof RequestValidationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    throw error;
  }
}
