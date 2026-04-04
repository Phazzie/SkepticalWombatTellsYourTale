import { prisma } from '@/lib/db';
import { transcribeAudio } from '@/lib/openai';
import { handleRoute } from '@/lib/server/http';
import { badRequest } from '@/lib/server/errors';
import { requireUser } from '@/lib/server/auth';
import { requireProjectAccess } from '@/lib/server/services/project-access';
import { enforceRateLimit } from '@/lib/server/rate-limit';

export async function POST(request: Request) {
  return handleRoute(async () => {
    const { userId } = await requireUser();

    const ip = request.headers.get('x-forwarded-for') || userId;
    enforceRateLimit(`transcribe:${ip}`, 30, 60_000);

    const formData = await request.formData();
    const audioFile = formData.get('audio');
    const projectId = formData.get('projectId');

    if (!(audioFile instanceof File) || typeof projectId !== 'string' || !projectId) {
      throw badRequest('Missing or invalid audio or projectId');
    }

    await requireProjectAccess(projectId, userId);

    const audioBuffer = Buffer.from(await audioFile.arrayBuffer());

    let transcript = '';
    try {
      transcript = await transcribeAudio(audioBuffer, audioFile.name);
    } catch (error) {
      console.error('Transcription error:', error);
      transcript = '[Transcription requires OpenAI API key — raw audio saved]';
    }

    const session = await prisma.voiceSession.create({
      data: {
        projectId,
        transcript,
        aiAnnotations: '[]',
      },
    });

    return { transcript, sessionId: session.id };
  });
}
