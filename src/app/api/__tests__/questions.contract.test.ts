import test from 'node:test';
import assert from 'node:assert/strict';
import { validateSchema } from '@/lib/server/schema';
import { questionsPostSchema } from '@/lib/server/schemas/api/questions';

test('questions update contract accepts action/update payload', () => {
  const parsed = validateSchema(
    { action: 'update', questionId: 'q1', status: 'answered' },
    questionsPostSchema
  );

  assert.equal(parsed.action, 'update');
  assert.equal(parsed.questionId, 'q1');
  assert.equal(parsed.status, 'answered');
});
