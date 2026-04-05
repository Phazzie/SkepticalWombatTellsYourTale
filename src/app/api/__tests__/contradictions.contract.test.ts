import test from 'node:test';
import assert from 'node:assert/strict';
import { validateSchema } from '@/lib/server/schema';
import {
  contradictionsPatchSchema,
  contradictionsQuerySchema,
} from '@/lib/server/schemas/api/contradictions';

test('contradictions contract accepts valid patch payload', () => {
  const parsed = validateSchema(
    { contradictionId: 'x1', status: 'explored' },
    contradictionsPatchSchema
  );

  assert.equal(parsed.contradictionId, 'x1');
  assert.equal(parsed.status, 'explored');
});

test('contradictions contract accepts optional query status', () => {
  const empty = validateSchema({}, contradictionsQuerySchema);
  assert.equal(empty.status, undefined);

  const parsed = validateSchema({ status: 'dismissed' }, contradictionsQuerySchema);
  assert.equal(parsed.status, 'dismissed');
});

test('contradictions contract rejects invalid status values', () => {
  assert.throws(
    () => validateSchema({ contradictionId: 'x1', status: 'bad' }, contradictionsPatchSchema),
    /payload\.status must be one of: open, explored, dismissed/
  );
});
