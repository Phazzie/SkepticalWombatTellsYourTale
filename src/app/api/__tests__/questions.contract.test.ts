import test from 'node:test';
import assert from 'node:assert/strict';
import { handleRoute } from '@/lib/server/http';
import { validateSchema } from '@/lib/server/schema';
import { questionsPostSchema } from '@/lib/server/schemas/api/questions';
import { badRequest } from '@/lib/server/errors';

test('questions update contract accepts action/update payload', () => {
  const parsed = validateSchema(
    { action: 'update', questionId: 'q1', status: 'answered' },
    questionsPostSchema
  );

  assert.equal(parsed.action, 'update');
  assert.equal(parsed.questionId, 'q1');
  assert.equal(parsed.status, 'answered');
});

test('questions success contract returns 200 with required question fields', async () => {
  const response = await handleRoute(async () => [
    {
      id: 'q1',
      projectId: 'p1',
      text: 'What is next?',
      sessionRef: null,
      status: 'pending',
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
      updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    },
  ]);
  const payload = await response.json();

  assert.equal(response.status, 200);
  assert.ok(Array.isArray(payload));
  assert.equal(typeof payload[0].id, 'string');
  assert.equal(typeof payload[0].projectId, 'string');
  assert.equal(typeof payload[0].text, 'string');
  assert.equal(typeof payload[0].status, 'string');
});

test('questions error contract returns status + error (+details)', async () => {
  const request = new Request('http://localhost/api/projects/p1/questions', {
    headers: { 'x-request-id': 'questions-error-id' },
  });
  const response = await handleRoute(
    async () => {
      throw badRequest('Invalid question update payload', { field: 'status' });
    },
    { request, operation: 'projects.questions.mutate' }
  );
  const payload = await response.json();

  assert.equal(response.status, 400);
  assert.equal(payload.error, 'Invalid question update payload');
  assert.deepEqual(payload.details, { field: 'status' });
  assert.equal(payload.correlationId, 'questions-error-id');
});
