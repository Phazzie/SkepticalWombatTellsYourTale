import { AiPort } from '@/lib/server/ports/ai';
import { openAiPort } from '@/lib/server/adapters/ai/openai-ai-port';
import { aiWorkflowsRepository } from '@/lib/server/repositories/ai-workflows';
import { log } from '@/lib/server/logger';

export async function transcribeAndCreateSession(
  input: {
    projectId: string;
    audioBuffer: Buffer;
    filename: string;
    questionId?: string;
  },
  deps: {
    ai?: AiPort;
    createTranscribedSession?: (
      projectId: string,
      transcript: string,
      questionId: string | null
    ) => Promise<{ id: string }>;
  } = {}
) {
  const ai = deps.ai || openAiPort;
  const createTranscribedSession = deps.createTranscribedSession || aiWorkflowsRepository.createTranscribedSession;

  let transcript = '';
  try {
    transcript = await ai.transcribeAudio(input.audioBuffer, input.filename);
  } catch (error) {
    log('error', 'Transcription failed, storing fallback transcript', { error: String(error) });
    transcript = '[Transcription unavailable — configure OpenAI API key]';
  }

  const session = await createTranscribedSession(
    input.projectId,
    transcript,
    input.questionId || null
  );

  return { transcript, sessionId: session.id };
}
