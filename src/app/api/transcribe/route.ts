import { handleRoute } from '@/lib/server/http';
import { requireUser } from '@/lib/server/auth';
import { requireProjectAccess } from '@/lib/server/services/project-access';
import { transcribeAndCreateSession } from '@/lib/server/services/transcription.service';
import { enforceRateLimit } from '@/lib/server/rate-limit';
import {
  parseTranscribeRequest,
  validateTranscribeAudioFile,
} from '@/lib/server/routes/transcribe';

export async function POST(request: Request) {
  return handleRoute(async () => {
    const { userId } = await requireUser();

    const formData = await request.formData();
    const { audioFile, projectId, questionId } = parseTranscribeRequest(formData);
    await requireProjectAccess(projectId, userId);
    validateTranscribeAudioFile(audioFile);

    enforceRateLimit(`transcribe:${userId}:${projectId}`, 10, 60 * 60_000);

    const audioBuffer = Buffer.from(await audioFile.arrayBuffer());

    return transcribeAndCreateSession({
      projectId,
      audioBuffer,
      filename: audioFile.name,
      questionId,
    });
  }, { request, operation: 'transcribe' });
}
