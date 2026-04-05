import test from 'node:test';
import assert from 'node:assert/strict';
import { handleRoute } from '@/lib/server/http';
import { validateSchema } from '@/lib/server/schema';
import { analyzeRequestSchema } from '@/lib/server/schemas/api/analyze';

test('analyze request contract accepts required fields', () => {
  const parsed = validateSchema(
    { sessionId: 'session-1', transcript: 'hello' },
    analyzeRequestSchema
  );

  assert.equal(parsed.sessionId, 'session-1');
  assert.equal(parsed.transcript, 'hello');
});

test('analyze success contract returns 200 with required payload fields', async () => {
  const response = await handleRoute(async () => ({
    tangents: [],
    patterns: [],
    gaps: [],
    contradictions: [],
    questions: [],
    annotations: [],
  }));
  const payload = await response.json();

  assert.equal(response.status, 200);
  assert.ok(Array.isArray(payload.tangents));
  assert.ok(Array.isArray(payload.patterns));
  assert.ok(Array.isArray(payload.gaps));
  assert.ok(Array.isArray(payload.contradictions));
  assert.ok(Array.isArray(payload.questions));
  assert.ok(Array.isArray(payload.annotations));
});

test('analyze error contract returns 400 with error shape', async () => {
  const request = new Request('http://localhost/api/projects/p1/analyze', {
    headers: { 'x-request-id': 'analyze-error-id' },
  });
  const response = await handleRoute(
    async () => validateSchema({ sessionId: 's1' }, analyzeRequestSchema),
    { request, operation: 'projects.analyze' }
  );
  const payload = await response.json();

  assert.equal(response.status, 400);
  assert.equal(typeof payload.error, 'string');
  assert.equal(payload.correlationId, 'analyze-error-id');
});
