import test from 'node:test';
import assert from 'node:assert/strict';
import { handleRoute } from '@/lib/server/http';
import { AppError, badRequest } from '@/lib/server/errors';
import { parseTranscribeRequest, validateTranscribeAudioFile, ALLOWED_AUDIO_MIME_TYPES } from '@/lib/server/routes/transcribe';

function normalizeQuestionId(value: FormDataEntryValue | null) {
  return typeof value === 'string' && value ? value : undefined;
}

test('transcribe contract optional questionId normalization', () => {
  assert.equal(normalizeQuestionId(null), undefined);
  assert.equal(normalizeQuestionId(''), undefined);
  assert.equal(normalizeQuestionId('q1'), 'q1');
});

test('transcribe success contract returns 200 with transcript and sessionId', async () => {
  const response = await handleRoute(async () => ({
    transcript: 'hello world',
    sessionId: 'session-1',
  }));
  const payload = await response.json();

  assert.equal(response.status, 200);
  assert.equal(typeof payload.transcript, 'string');
  assert.equal(typeof payload.sessionId, 'string');
});

test('transcribe error contract returns 400 with error shape', async () => {
  const request = new Request('http://localhost/api/transcribe', {
    headers: { 'x-request-id': 'transcribe-error-id' },
  });
  const response = await handleRoute(
    async () => {
      throw badRequest('Missing or invalid audio or projectId');
    },
    { request, operation: 'transcribe' }
  );
  const payload = await response.json();

  assert.equal(response.status, 400);
  assert.equal(payload.error, 'Missing or invalid audio or projectId');
  assert.equal(payload.correlationId, 'transcribe-error-id');
});

test('transcribe request parser rejects missing audio/project fields with 400', () => {
  const formData = new FormData();
  assert.throws(
    () => parseTranscribeRequest(formData),
    (error: unknown) => error instanceof AppError && error.status === 400
  );
});

test('transcribe audio validator rejects unsupported MIME type with 400', () => {
  const file = new File(['hello'], 'audio.txt', { type: 'text/plain' });
  assert.throws(
    () => validateTranscribeAudioFile(file),
    (error: unknown) => error instanceof AppError && error.status === 400
  );
});

test('parseTranscribeRequest succeeds with valid audio file and projectId', () => {
  const formData = new FormData();
  const file = new File(['audio-bytes'], 'voice.webm', { type: 'audio/webm' });
  formData.set('audio', file);
  formData.set('projectId', 'proj-1');

  const result = parseTranscribeRequest(formData);
  assert.equal(result.projectId, 'proj-1');
  assert.equal(result.audioFile, file);
  assert.equal(result.questionId, undefined);
});

test('parseTranscribeRequest returns questionId when provided', () => {
  const formData = new FormData();
  formData.set('audio', new File(['data'], 'voice.webm', { type: 'audio/webm' }));
  formData.set('projectId', 'proj-2');
  formData.set('questionId', 'q-99');

  const result = parseTranscribeRequest(formData);
  assert.equal(result.questionId, 'q-99');
});

test('parseTranscribeRequest treats empty questionId string as absent', () => {
  const formData = new FormData();
  formData.set('audio', new File(['data'], 'voice.webm', { type: 'audio/webm' }));
  formData.set('projectId', 'proj-3');
  formData.set('questionId', '');

  const result = parseTranscribeRequest(formData);
  assert.equal(result.questionId, undefined);
});

test('parseTranscribeRequest rejects empty projectId with 400', () => {
  const formData = new FormData();
  formData.set('audio', new File(['data'], 'voice.webm', { type: 'audio/webm' }));
  formData.set('projectId', '');

  assert.throws(
    () => parseTranscribeRequest(formData),
    (error: unknown) => error instanceof AppError && error.status === 400
  );
});

test('validateTranscribeAudioFile accepts all supported audio MIME types', () => {
  for (const mimeType of ALLOWED_AUDIO_MIME_TYPES) {
    const file = new File(['audio-content'], 'audio', { type: mimeType });
    assert.doesNotThrow(
      () => validateTranscribeAudioFile(file),
      `Expected ${mimeType} to be accepted`
    );
  }
});

test('validateTranscribeAudioFile rejects empty file (size 0) with 400', () => {
  const emptyFile = new File([], 'silent.webm', { type: 'audio/webm' });
  assert.throws(
    () => validateTranscribeAudioFile(emptyFile),
    (error: unknown) => error instanceof AppError && error.status === 400
  );
});

test('validateTranscribeAudioFile rejects oversized file with 400', () => {
  const bigData = new Uint8Array(16 * 1024 * 1024); // 16 MB of zeros
  const oversized = new File([bigData], 'big.webm', { type: 'audio/webm' });

  assert.throws(
    () => validateTranscribeAudioFile(oversized),
    (error: unknown) => error instanceof AppError && error.status === 400
  );
});
