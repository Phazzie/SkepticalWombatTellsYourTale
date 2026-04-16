import { badRequest } from '@/lib/server/errors';

const MAX_AUDIO_BYTES = 15 * 1024 * 1024;
const MAX_AUDIO_MB = Math.floor(MAX_AUDIO_BYTES / (1024 * 1024));
export const ALLOWED_AUDIO_MIME_TYPES = new Set([
  'audio/mpeg',
  'audio/mp3',
  'audio/mp4',
  'audio/webm',
  'audio/wav',
  'audio/x-wav',
  'audio/ogg',
  'audio/flac',
  'audio/x-flac',
  'audio/aac',
  'audio/m4a',
]);

export function parseTranscribeRequest(formData: FormData) {
  const audioFile = formData.get('audio');
  const projectId = formData.get('projectId');
  const questionId = formData.get('questionId');

  if (!(audioFile instanceof File) || typeof projectId !== 'string' || !projectId) {
    throw badRequest('Missing or invalid audio or projectId');
  }

  return {
    audioFile,
    projectId,
    questionId: typeof questionId === 'string' && questionId ? questionId : undefined,
  };
}

export function validateTranscribeAudioFile(audioFile: File) {
  const mimeType = audioFile.type?.toLowerCase() || '';
  if (!ALLOWED_AUDIO_MIME_TYPES.has(mimeType)) {
    throw badRequest('Unsupported audio format');
  }

  if (audioFile.size <= 0 || audioFile.size > MAX_AUDIO_BYTES) {
    throw badRequest(`Audio file must be between 1 byte and ${MAX_AUDIO_MB} MB`);
  }
}
