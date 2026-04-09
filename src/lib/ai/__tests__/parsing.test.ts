import test from 'node:test';
import assert from 'node:assert/strict';
import {
  asObject,
  asStringArray,
  parseAiJsonObject,
  parseAiJsonObjectStrict,
  safeString,
} from '@/lib/ai/parsing';

// Suppress console.warn so warning-path tests don't pollute CI output.
function withSilencedWarn<T>(fn: () => T): T {
  const original = console.warn;
  console.warn = () => {};
  try {
    return fn();
  } finally {
    console.warn = original;
  }
}

// ---------------------------------------------------------------------------
// parseAiJsonObject
// ---------------------------------------------------------------------------

test('parseAiJsonObject returns parsed value for valid JSON', () => {
  const result = parseAiJsonObject<{ name: string }>({
    content: JSON.stringify({ name: 'alice' }),
    fallback: { name: 'fallback' },
    label: 'test',
  });
  assert.deepEqual(result, { name: 'alice' });
});

test('parseAiJsonObject returns fallback for null content', () => {
  const fallback = { name: 'default' };
  const result = withSilencedWarn(() =>
    parseAiJsonObject<{ name: string }>({
      content: null,
      fallback,
      label: 'test',
    })
  );
  assert.equal(result, fallback);
});

test('parseAiJsonObject returns fallback for empty string content', () => {
  const fallback = { name: 'default' };
  const result = withSilencedWarn(() =>
    parseAiJsonObject<{ name: string }>({
      content: '',
      fallback,
      label: 'test',
    })
  );
  assert.equal(result, fallback);
});

test('parseAiJsonObject returns fallback for invalid JSON', () => {
  const fallback = { name: 'default' };
  const result = withSilencedWarn(() =>
    parseAiJsonObject<{ name: string }>({
      content: '{bad json',
      fallback,
      label: 'test',
    })
  );
  assert.equal(result, fallback);
});

test('parseAiJsonObject applies normalize function when provided', () => {
  const result = parseAiJsonObject<string>({
    content: JSON.stringify({ raw: 'hello' }),
    fallback: '',
    label: 'test',
    normalize: (value) => (value as { raw: string }).raw.toUpperCase(),
  });
  assert.equal(result, 'HELLO');
});

test('parseAiJsonObject returns fallback when normalize throws', () => {
  const fallback = 'safe';
  const result = withSilencedWarn(() =>
    parseAiJsonObject<string>({
      content: JSON.stringify({ name: 'x' }),
      fallback,
      label: 'test',
      normalize: () => {
        throw new Error('normalize failed');
      },
    })
  );
  assert.equal(result, fallback);
});

// ---------------------------------------------------------------------------
// parseAiJsonObjectStrict
// ---------------------------------------------------------------------------

test('parseAiJsonObjectStrict returns value and empty contractIssues for valid input', () => {
  const result = parseAiJsonObjectStrict<{ value: string }>({
    content: JSON.stringify({ value: 'ok' }),
    fallback: { value: '' },
    label: 'test',
    normalize: (parsed) => ({
      value: parsed as { value: string },
      contractIssues: [],
    }),
  });
  assert.deepEqual(result.value, { value: 'ok' });
  assert.deepEqual(result.contractIssues, []);
  assert.equal(result.parseError, undefined);
});

test('parseAiJsonObjectStrict returns fallback and contract issue for null content', () => {
  const fallback = { value: 'fallback' };
  const result = withSilencedWarn(() =>
    parseAiJsonObjectStrict<{ value: string }>({
      content: null,
      fallback,
      label: 'test',
      normalize: () => ({ value: { value: 'should not run' }, contractIssues: [] }),
    })
  );
  assert.equal(result.value, fallback);
  assert.ok(result.contractIssues.length > 0);
  assert.equal(result.parseError, 'missing_content');
});

test('parseAiJsonObjectStrict returns fallback and contract issue for invalid JSON', () => {
  const fallback = { value: 'fallback' };
  const result = withSilencedWarn(() =>
    parseAiJsonObjectStrict<{ value: string }>({
      content: '{bad',
      fallback,
      label: 'test',
      normalize: () => ({ value: { value: 'should not run' }, contractIssues: [] }),
    })
  );
  assert.equal(result.value, fallback);
  assert.ok(result.contractIssues.some((issue) => issue.includes('JSON parse failed')));
  assert.ok(typeof result.parseError === 'string');
});

test('parseAiJsonObjectStrict returns fallback and contract issue when normalize throws', () => {
  const fallback = { value: 'fallback' };
  const result = withSilencedWarn(() =>
    parseAiJsonObjectStrict<{ value: string }>({
      content: JSON.stringify({ value: 'ok' }),
      fallback,
      label: 'test',
      normalize: () => {
        throw new Error('normalizer exploded');
      },
    })
  );
  assert.equal(result.value, fallback);
  assert.deepEqual(result.contractIssues, ['AI response JSON parse failed']);
  assert.ok(typeof result.parseError === 'string' && result.parseError.includes('normalizer exploded'));
});

test('parseAiJsonObjectStrict passes through contractIssues from normalize', () => {
  const result = parseAiJsonObjectStrict<string[]>({
    content: JSON.stringify([{ text: 'q' }]),
    fallback: [],
    label: 'test',
    normalize: (parsed) => ({
      value: (parsed as Array<{ text: string }>).map((item) => item.text),
      contractIssues: ['contextAnchor is required'],
    }),
  });
  assert.deepEqual(result.contractIssues, ['contextAnchor is required']);
  assert.deepEqual(result.value, ['q']);
});

// ---------------------------------------------------------------------------
// asStringArray
// ---------------------------------------------------------------------------

test('asStringArray filters non-string entries from mixed array', () => {
  const result = asStringArray(['a', 1, 'b', null, true, 'c']);
  assert.deepEqual(result, ['a', 'b', 'c']);
});

test('asStringArray returns empty array for empty input', () => {
  assert.deepEqual(asStringArray([]), []);
});

test('asStringArray returns empty array for non-array input', () => {
  assert.deepEqual(asStringArray('string'), []);
  assert.deepEqual(asStringArray(null), []);
  assert.deepEqual(asStringArray({ key: 'val' }), []);
  assert.deepEqual(asStringArray(42), []);
});

// ---------------------------------------------------------------------------
// asObject
// ---------------------------------------------------------------------------

test('asObject returns the same object reference for a plain object', () => {
  const obj = { key: 'value' };
  const result = asObject(obj);
  assert.equal(result, obj);
});

test('asObject returns empty object for an array', () => {
  assert.deepEqual(asObject(['a', 'b']), {});
});

test('asObject returns empty object for null', () => {
  assert.deepEqual(asObject(null), {});
});

test('asObject returns empty object for a string', () => {
  assert.deepEqual(asObject('hello'), {});
});

test('asObject returns empty object for a number', () => {
  assert.deepEqual(asObject(42), {});
});

// ---------------------------------------------------------------------------
// safeString
// ---------------------------------------------------------------------------

test('safeString returns the string value unchanged', () => {
  assert.equal(safeString('hello'), 'hello');
});

test('safeString returns default fallback for non-string value', () => {
  assert.equal(safeString(42), '');
  assert.equal(safeString(null), '');
  assert.equal(safeString(undefined), '');
  assert.equal(safeString({}), '');
});

test('safeString returns custom fallback for non-string value', () => {
  assert.equal(safeString(null, 'none'), 'none');
  assert.equal(safeString(false, 'default'), 'default');
});

