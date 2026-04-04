import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { openai } from '@/lib/openai';
import { normalizeQuestionsFromContent } from '@/lib/ai-contract';

export async function GET() {
  // Questions are generated on demand via POST and not persisted.
  // The UI calls POST to generate fresh AI questions each time.
  return NextResponse.json([]);
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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

    const questions = normalizeQuestionsFromContent(response.choices[0].message.content);
    return NextResponse.json(questions);
  } catch (error) {
    console.error('Question generation error:', error);
    return NextResponse.json([]);
  }
}
