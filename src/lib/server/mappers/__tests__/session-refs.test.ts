import test from 'node:test';
import assert from 'node:assert/strict';
import { parseSessionRefs, stringifySessionRefs } from '@/lib/server/mappers/session-refs';

test('parseSessionRefs returns only string entries from array JSON', () => {
  const refs = parseSessionRefs(JSON.stringify(['s1', 2, 's2', null]));
  assert.deepEqual(refs, ['s1', 's2']);
});

test('parseSessionRefs returns empty for nullish, malformed, or non-array values', () => {
  assert.deepEqual(parseSessionRefs(null), []);
  assert.deepEqual(parseSessionRefs(undefined), []);
  assert.deepEqual(parseSessionRefs('{"k":"v"}'), []);
  assert.deepEqual(parseSessionRefs('{bad-json}'), []);
});

test('stringifySessionRefs keeps only strings and serializes as JSON array', () => {
  const serialized = stringifySessionRefs(['s1', 3, 's2']);
  assert.equal(serialized, '["s1","s2"]');
});

test('stringifySessionRefs returns empty array JSON for non-array input', () => {
  assert.equal(stringifySessionRefs('not-array'), '[]');
});
