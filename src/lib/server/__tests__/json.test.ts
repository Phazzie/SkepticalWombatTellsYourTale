import test from 'node:test';
import assert from 'node:assert/strict';
import { safeParseJson } from '@/lib/server/json';

test('safeParseJson returns parsed value for valid JSON', () => {
  const parsed = safeParseJson<{ name: string }>('{"name":"alice"}', { name: 'fallback' });
  assert.deepEqual(parsed, { name: 'alice' });
});

test('safeParseJson returns fallback for invalid JSON', () => {
  const fallback = { ok: false };
  const parsed = safeParseJson('{invalid json}', fallback);
  assert.equal(parsed, fallback);
});
