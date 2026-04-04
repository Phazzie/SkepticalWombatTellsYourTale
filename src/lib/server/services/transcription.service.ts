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
  deps: { ai?: AiPort } = {}
) {
  const ai = deps.ai || openAiPort;

  let transcript = '';
  try {
    transcript = await ai.transcribeAudio(input.audioBuffer, input.filename);
  } catch (error) {
    log('error', 'Transcription failed, storing fallback transcript', { error: String(error) });
    transcript = '[Transcription requires OpenAI API key — raw audio saved]';
  }

  const session = await aiWorkflowsRepository.createTranscribedSession(
    input.projectId,
    transcript,
    input.questionId || null
  );

  return { transcript, sessionId: session.id };
}
