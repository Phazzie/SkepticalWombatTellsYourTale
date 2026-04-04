import { prisma } from '@/lib/db';
import { openai } from '@/lib/openai';
import { handleRoute } from '@/lib/server/http';
import { requireUser } from '@/lib/server/auth';
import { requireProjectAccess } from '@/lib/server/services/project-access';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleRoute(async () => {
    const { userId } = await requireUser();
    const { id } = await params;
    await requireProjectAccess(id, userId);

    return [];
  });
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleRoute(async () => {
    const { userId } = await requireUser();
    const { id } = await params;
    await requireProjectAccess(id, userId);

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        documents: true,
        sessions: { orderBy: { createdAt: 'desc' }, take: 5 },
      },
    });

    if (!project) {
      return [];
    }

    const context = project.sessions
      .map((s) => s.transcript.slice(0, 500))
      .join('\n\n');

    const docsContext = project.documents
      .map((d) => `${d.name}: ${d.content.slice(0, 300)}`)
      .join('\n');

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a skilled interviewer who asks questions that pull out the real story. Generate specific, pointed questions based on what the person has said — not generic prompts. Questions like "what happened right before that?" or "you mentioned X but never said what happened next." Return JSON only.',
        },
        {
          role: 'user',
          content: `Generate 8 specific questions for this project.\n\nRECENT TRANSCRIPTS:\n${context}\n\nDOCUMENTS:\n${docsContext}\n\nReturn JSON: { "questions": [{ "text": "question text", "sessionRef": null }] }`,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.8,
    });

    const result = JSON.parse(response.choices[0].message.content || '{"questions":[]}') as {
      questions?: Array<{ text: string; sessionRef?: string }>;
    };

    return (result.questions || []).map((q) => ({
      ...q,
      createdAt: new Date().toISOString(),
    }));
  });
}
