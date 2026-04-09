import { openai } from '@/lib/ai/client';
import { AI_MODELS } from '@/lib/ai/config';
import { withRetry } from '@/lib/ai/retry';
import { log } from '@/lib/server/logger';

export async function transcribeAudio(audioBuffer: Buffer, filename: string): Promise<string> {
  const file = new File([new Uint8Array(audioBuffer)], filename, { type: 'audio/webm' });
  log('info', 'transcribeAudio start', { model: AI_MODELS.transcription, filename });
  const startTime = Date.now();
  try {
    const response = await withRetry(() => openai.audio.transcriptions.create({
      file,
      model: AI_MODELS.transcription,
      response_format: 'text',
    }));
    log('info', 'transcribeAudio success', { durationMs: Date.now() - startTime });
    return response;
  } catch (err) {
    log('error', 'transcribeAudio failed', { filename, error: String(err), durationMs: Date.now() - startTime });
    throw err;
  }
}
