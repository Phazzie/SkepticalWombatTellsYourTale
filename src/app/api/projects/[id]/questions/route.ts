import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { openai } from '@/lib/openai';

const VALID_STATUSES = ['pending', 'answered', 'dismissed'] as const;
type QuestionStatus = typeof VALID_STATUSES[number];

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const url = new URL(request.url);
  const status = url.searchParams.get('status');

  const questions = await prisma.question.findMany({
    where: {
      projectId: id,
      ...(status && VALID_STATUSES.includes(status as QuestionStatus)
        ? { status: status as QuestionStatus }
        : {}),
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(questions);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json().catch(() => ({} as Record<string, unknown>));
  const action = typeof body.action === 'string' ? body.action : 'generate';

  if (action === 'update') {
    const questionId = typeof body.questionId === 'string' ? body.questionId : '';
    const status = typeof body.status === 'string' ? body.status : '';

    if (!questionId || !VALID_STATUSES.includes(status as QuestionStatus)) {
      return NextResponse.json({ error: 'Invalid question update payload' }, { status: 400 });
    }

    const existing = await prisma.question.findFirst({ where: { id: questionId, projectId: id } });
    if (!existing) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    const updated = await prisma.question.update({
      where: { id: questionId },
      data: { status: status as QuestionStatus },
    });

    return NextResponse.json(updated);
  }

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      documents: true,
      sessions: { orderBy: { createdAt: 'desc' }, take: 5 },
    },
  });

  if (!project) return NextResponse.json([], { status: 404 });

  const context = project.sessions
    .map((s) => s.transcript.slice(0, 500))
    .join('\n\n');

  const docsContext = project.documents
    .map((d) => `${d.name}: ${d.content.slice(0, 300)}`)
    .join('\n');

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a skilled interviewer who asks questions that pull out the real story. Generate specific, pointed questions based on what the person has said — not generic prompts. Questions like "what happened right before that?" or "you mentioned X but never said what happened next." Return JSON only.',
        },
        {
          role: 'user',
          content: `Generate 8 specific questions for this project.

RECENT TRANSCRIPTS:
${context}

DOCUMENTS:
${docsContext}

Return JSON: { "questions": [{ "text": "question text", "sessionRef": null }] }`,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.8,
    });

    const result = JSON.parse(response.choices[0].message.content || '{"questions":[]}');
    const candidates: Array<{ text: string; sessionRef?: string }> = result.questions || [];
    if (candidates.length === 0) return NextResponse.json([]);

    const created = await prisma.$transaction(
      candidates.map((q) =>
        prisma.question.create({
          data: {
            projectId: id,
            text: q.text,
            sessionRef: q.sessionRef || null,
            status: 'pending',
          },
        })
      )
    );
    return NextResponse.json(created);
  } catch (error) {
    console.error('Question generation error:', error);
    return NextResponse.json([]);
  }
}
