import test from 'node:test';
import assert from 'node:assert/strict';
import { AppError } from '@/lib/server/errors';
import {
  arraySchema,
  booleanSchema,
  literalUnionSchema,
  nullableSchema,
  objectSchema,
  optionalSchema,
  stringSchema,
  validateSchema,
} from '@/lib/server/schema';

test('stringSchema trims by default and enforces min/max', () => {
  const schema = stringSchema({ min: 2, max: 5 });
  assert.equal(schema.parse('  abc  ', 'field'), 'abc');
  assert.throws(() => schema.parse(' a ', 'field'), /field must be at least 2 characters/);
  assert.throws(() => schema.parse('abcdef', 'field'), /field must be at most 5 characters/);
});

test('stringSchema supports trim false', () => {
  const schema = stringSchema({ min: 3, trim: false });
  assert.equal(schema.parse('  a', 'field'), '  a');
});

test('booleanSchema validates boolean values', () => {
  const schema = booleanSchema();
  assert.equal(schema.parse(true), true);
  assert.throws(() => schema.parse('true', 'flag'), /flag must be a boolean/);
});

test('literalUnionSchema validates allowed literals', () => {
  const schema = literalUnionSchema(['open', 'closed'] as const);
  assert.equal(schema.parse('open', 'status'), 'open');
  assert.throws(() => schema.parse('pending', 'status'), /status must be one of: open, closed/);
});

test('optionalSchema and nullableSchema normalize missing values', () => {
  const optionalString = optionalSchema(stringSchema({ min: 1 }));
  const nullableString = nullableSchema(stringSchema({ min: 1 }));

  assert.equal(optionalString.parse(undefined, 'name'), undefined);
  assert.equal(nullableString.parse(undefined, 'name'), null);
  assert.equal(nullableString.parse(null, 'name'), null);
  assert.equal(nullableString.parse('abc', 'name'), 'abc');
});

test('arraySchema validates entries and error path includes index', () => {
  const schema = arraySchema(stringSchema({ min: 1 }));
  const parsed = schema.parse(['a', 'b'], 'items');
  assert.deepEqual(parsed, ['a', 'b']);
  assert.throws(() => schema.parse(['ok', ''], 'items'), /items\[1\] must be at least 1 characters/);
});

test('objectSchema validates object shape and nested paths', () => {
  const schema = objectSchema({
    name: stringSchema({ min: 1 }),
    active: booleanSchema(),
  });

  const parsed = schema.parse({ name: 'x', active: false }, 'payload');
  assert.deepEqual(parsed, { name: 'x', active: false });

  assert.throws(() => schema.parse([], 'payload'), /payload must be an object/);
  assert.throws(() => schema.parse({ name: '', active: true }, 'payload'), /payload.name must be at least 1 characters/);
});

test('validateSchema delegates to schema parser and throws AppError(400) on failure', () => {
  const schema = objectSchema({
    value: stringSchema({ min: 1 }),
  });

  const parsed = validateSchema({ value: 'ok' }, schema, 'payload');
  assert.equal(parsed.value, 'ok');

  assert.throws(
    () => validateSchema({ value: '' }, schema, 'payload'),
    (error: unknown) => error instanceof AppError && error.status === 400
  );
});
