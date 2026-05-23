import { handleRoute } from '@/lib/server/http';
import { requireUser } from '@/lib/server/auth';
import { requireProjectAccess } from '@/lib/server/services/project-access';
import { transcribeAndCreateSession } from '@/lib/server/services/transcription.service';
import { enforceRateLimit } from '@/lib/server/rate-limit';
import { badRequest } from '@/lib/server/errors';
import {
  parseTranscribeRequest,
  validateTranscribeAudioFile,
} from '@/lib/server/routes/transcribe';

function isMissingAiConfigError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes('API key') ||
    message.includes('Missing credentials') ||
    message.includes('AI_CONFIG_MISSING') ||
    !process.env.OPENAI_API_KEY
  );
}

export async function POST(request: Request) {
  return handleRoute(async () => {
    const { userId } = await requireUser();

    const formData = await request.formData();
    const { audioFile, projectId, questionId } = parseTranscribeRequest(formData);
    await requireProjectAccess(projectId, userId);
    validateTranscribeAudioFile(audioFile);

    enforceRateLimit(`transcribe:${userId}:${projectId}`, 10, 60 * 60_000);

    // Avoid Buffer.from() which spikes memory on serverless for large 15MB files.
    // OpenAI v4 SDK accepts the Web File object directly.
    try {
      return await transcribeAndCreateSession({
        projectId,
        audioFile,
        filename: audioFile.name,
        questionId,
      });
    } catch (error: unknown) {
      if (isMissingAiConfigError(error)) {
        throw badRequest('OPENAI_API_KEY is required to transcribe audio. Configure the key and try again.');
      }
      throw error;
    }
  }, { request, operation: 'transcribe' });
}
