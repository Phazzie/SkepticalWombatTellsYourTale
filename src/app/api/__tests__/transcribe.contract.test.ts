import test from 'node:test';
import assert from 'node:assert/strict';
import { handleRoute } from '@/lib/server/http';
import { AppError, badRequest } from '@/lib/server/errors';
import { parseTranscribeRequest, validateTranscribeAudioFile } from '@/lib/server/routes/transcribe';

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
