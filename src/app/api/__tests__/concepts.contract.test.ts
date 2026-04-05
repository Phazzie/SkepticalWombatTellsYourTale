import test from 'node:test';
import assert from 'node:assert/strict';
import { validateSchema } from '@/lib/server/schema';
import { conceptsPatchSchema } from '@/lib/server/schemas/api/concepts';

test('concepts patch contract accepts approved and status updates', () => {
  const parsed = validateSchema(
    { conceptId: 'c1', approved: true, status: 'complete' },
    conceptsPatchSchema
  );

  assert.equal(parsed.conceptId, 'c1');
  assert.equal(parsed.approved, true);
  assert.equal(parsed.status, 'complete');
});

test('concepts patch contract rejects invalid status', () => {
  assert.throws(
    () => validateSchema({ conceptId: 'c1', status: 'unknown' }, conceptsPatchSchema),
    /payload\.status must be one of: developing, complete, contradicted/
  );
});
