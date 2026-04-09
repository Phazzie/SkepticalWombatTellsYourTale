import test from 'node:test';
import assert from 'node:assert/strict';
import { AppError } from '@/lib/server/errors';
import {
  asOptionalString,
  assertBoolean,
  assertRawString,
  assertString,
  parseJsonBody,
} from '@/lib/server/validation';

test('assertString trims and validates min/max', () => {
  assert.equal(assertString('  hello  ', 'field', { min: 3, max: 10 }), 'hello');
  assert.throws(() => assertString(1, 'field'), /field must be a string/);
  assert.throws(() => assertString(' a ', 'field', { min: 2 }), /field must be at least 2 characters/);
  assert.throws(() => assertString('too-long-value', 'field', { max: 5 }), /field must be at most 5 characters/);
});

test('assertRawString does not trim and validates raw length', () => {
  assert.equal(assertRawString('  hi  ', 'raw', { min: 2, max: 10 }), '  hi  ');
  assert.throws(() => assertRawString('a', 'raw', { min: 2 }), /raw must be at least 2 characters/);
  assert.throws(() => assertRawString('abcdef', 'raw', { max: 5 }), /raw must be at most 5 characters/);
});

test('assertBoolean accepts booleans and rejects non-booleans', () => {
  assert.equal(assertBoolean(true, 'flag'), true);
  assert.equal(assertBoolean(false, 'flag'), false);
  assert.throws(() => assertBoolean('true', 'flag'), /flag must be a boolean/);
});

test('asOptionalString returns null for nullish and trims strings', () => {
  assert.equal(asOptionalString(undefined, 'name'), null);
  assert.equal(asOptionalString(null, 'name'), null);
  assert.equal(asOptionalString('  bob  ', 'name'), 'bob');
  assert.throws(() => asOptionalString(42, 'name'), /name must be a string/);
  assert.throws(() => asOptionalString('123456', 'name', { max: 5 }), /name must be at most 5 characters/);
});

test('validation errors are AppError(400)', () => {
  assert.throws(
    () => assertString(null, 'field'),
    (error: unknown) => error instanceof AppError && error.status === 400
  );
});

test('parseJsonBody returns parsed JSON and maps invalid JSON to AppError(400)', async () => {
  const validRequest = new Request('http://localhost/api/test', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ ok: true }),
  });
  const parsed = await parseJsonBody<{ ok: boolean }>(validRequest);
  assert.equal(parsed.ok, true);

  const invalidRequest = new Request('http://localhost/api/test', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: '{bad',
  });
  await assert.rejects(
    () => parseJsonBody(invalidRequest),
    (error: unknown) => error instanceof AppError && error.status === 400
  );
});
