import { handleRoute } from '@/lib/server/http';
import { requireUser } from '@/lib/server/auth';
import { requireProjectAccess } from '@/lib/server/services/project-access';
import { badRequest } from '@/lib/server/errors';
import { transcribeAndCreateSession } from '@/lib/server/services/transcription.service';
import { enforceRateLimit } from '@/lib/server/rate-limit';

export async function POST(request: Request) {
  return handleRoute(async () => {
    const { userId } = await requireUser();

    const formData = await request.formData();
    const audioFile = formData.get('audio');
    const projectId = formData.get('projectId');
    const questionId = formData.get('questionId');

    if (!(audioFile instanceof File) || typeof projectId !== 'string' || !projectId) {
      throw badRequest('Missing or invalid audio or projectId');
    }

    await requireProjectAccess(projectId, userId);

    enforceRateLimit(`transcribe:${userId}:${projectId}`, 10, 60 * 60_000);

    const audioBuffer = Buffer.from(await audioFile.arrayBuffer());

    return transcribeAndCreateSession({
      projectId,
      audioBuffer,
      filename: audioFile.name,
      questionId: typeof questionId === 'string' && questionId ? questionId : undefined,
    });
  }, { request, operation: 'transcribe' });
}
