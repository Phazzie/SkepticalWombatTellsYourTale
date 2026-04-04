import test from 'node:test';
import assert from 'node:assert/strict';
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
