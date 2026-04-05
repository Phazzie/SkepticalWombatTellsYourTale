import test from 'node:test';
import assert from 'node:assert/strict';
import { validateSchema } from '@/lib/server/schema';
import { voiceDraftRequestSchema } from '@/lib/server/schemas/api/voice-draft';

test('voice draft contract accepts prompt with optional nullable documentId', () => {
  const parsedWithId = validateSchema(
    { documentId: 'doc-1', prompt: 'Write in my voice' },
    voiceDraftRequestSchema
  );
  assert.equal(parsedWithId.documentId, 'doc-1');
  assert.equal(parsedWithId.prompt, 'Write in my voice');

  const parsedWithoutId = validateSchema(
    { documentId: null, prompt: 'Write in my voice' },
    voiceDraftRequestSchema
  );
  assert.equal(parsedWithoutId.documentId, null);
});

test('voice draft contract rejects empty prompt', () => {
  assert.throws(
    () => validateSchema({ prompt: '' }, voiceDraftRequestSchema),
    /payload\.prompt must be at least 1 characters/
  );
});
