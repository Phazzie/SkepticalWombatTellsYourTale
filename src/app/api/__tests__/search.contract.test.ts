import test from 'node:test';
import assert from 'node:assert/strict';
import { validateSchema } from '@/lib/server/schema';
import { searchQuerySchema } from '@/lib/server/schemas/api/search';

test('search contract accepts optional query and trims non-empty q', () => {
  const empty = validateSchema({}, searchQuerySchema);
  assert.equal(empty.q, undefined);

  const parsed = validateSchema({ q: '  memory  ' }, searchQuerySchema);
  assert.equal(parsed.q, 'memory');
});

test('search contract rejects empty q string', () => {
  assert.throws(
    () => validateSchema({ q: '' }, searchQuerySchema),
    /payload\.q must be at least 1 characters/
  );
});
