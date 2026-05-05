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
      const errMessage = error instanceof Error ? error.message : String(error);
      if (errMessage.includes('API key') || errMessage.includes('Missing credentials') || !process.env.OPENAI_API_KEY) {
        throw new Error('AI_CONFIG_MISSING: The OpenAI API key is missing. Please configure it in your environment variables.');
      }
      throw error;
    }
  }, { request, operation: 'transcribe' });
}
