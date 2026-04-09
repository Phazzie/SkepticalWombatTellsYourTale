import { openai } from '@/lib/ai/client';
import { AI_MODELS } from '@/lib/ai/config';

export async function transcribeAudio(audioBuffer: Buffer, filename: string): Promise<string> {
  const file = new File([new Uint8Array(audioBuffer)], filename, { type: 'audio/webm' });
  const response = await openai.audio.transcriptions.create({
    file,
    model: AI_MODELS.transcription,
    response_format: 'text',
  });
  return response;
}
