import { openai } from '@/lib/ai/client';
import { AI_MODELS } from '@/lib/ai/config';
import { withRetry } from '@/lib/ai/retry';
import { log } from '@/lib/server/logger';

function isWebFile(audio: File | Buffer): audio is File {
  return typeof File !== 'undefined' && audio instanceof File;
}

function toTranscriptionFile(audio: File | Buffer, filename: string): File {
  if (isWebFile(audio)) {
    return audio;
  }

  return new File([new Uint8Array(audio)], filename, { type: 'audio/webm' });
}

export async function transcribeAudio(audioFile: File | Buffer, filename: string): Promise<string> {
  const file = toTranscriptionFile(audioFile, filename);
  log('info', 'transcribeAudio start', {
    model: AI_MODELS.transcription,
    filename: file.name || filename,
    size: file.size,
    type: file.type,
  });
  const startTime = Date.now();
  try {
    const response = await withRetry((signal) => openai.audio.transcriptions.create({
      file,
      model: AI_MODELS.transcription,
      response_format: 'text',
    }, { signal }));
    log('info', 'transcribeAudio success', { durationMs: Date.now() - startTime });
    return response;
  } catch (err) {
    log('error', 'transcribeAudio failed', { filename, error: String(err), durationMs: Date.now() - startTime });
    throw err;
  }
}
