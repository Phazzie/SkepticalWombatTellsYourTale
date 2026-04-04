import { prisma } from '@/lib/db';
import { generateVoicePreservedDraft } from '@/lib/openai';
import { handleRoute } from '@/lib/server/http';
import { requireUser } from '@/lib/server/auth';
import { requireProjectAccess } from '@/lib/server/services/project-access';
import { assertString } from '@/lib/server/validation';
import { notFound } from '@/lib/server/errors';
import { sessionsRepository } from '@/lib/server/repositories/sessions';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleRoute(async () => {
    const { userId } = await requireUser();
    const { id } = await params;
    await requireProjectAccess(id, userId);

    const body = (await request.json()) as { documentId?: unknown; prompt?: unknown };
    const prompt = assertString(body.prompt, 'prompt', { min: 1, max: 2000 });
    const documentId = typeof body.documentId === 'string' && body.documentId.trim() ? body.documentId : null;

    const [sessions, document] = await Promise.all([
      sessionsRepository.listRecentByProject(id, 10),
      documentId
        ? prisma.document.findFirst({ where: { id: documentId, projectId: id } })
        : Promise.resolve(null),
    ]);

    if (documentId && !document) {
      throw notFound('Document not found');
    }

    try {
      const draft = await generateVoicePreservedDraft(
        prompt,
        sessions.map((s) => s.transcript),
        document ? document.content : ''
      );

      return { draft };
    } catch (error) {
      console.error('Voice draft error:', error);
      return { draft: 'Voice draft generation requires OpenAI API key.' };
    }
  });
}
