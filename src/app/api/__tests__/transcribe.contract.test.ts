import test from 'node:test';
import assert from 'node:assert/strict';
import { handleRoute } from '@/lib/server/http';
import { badRequest } from '@/lib/server/errors';

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
