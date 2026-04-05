import test from 'node:test';
import assert from 'node:assert/strict';
import { parseAiAnnotations, stringifyAiAnnotations } from '@/lib/server/mappers/ai-annotations';

test('parseAiAnnotations returns valid annotations and filters invalid entries', () => {
  const parsed = parseAiAnnotations(
    JSON.stringify([
      { type: 'important', text: 'keep this', reference: 'ref', timestamp: 123 },
      { type: 'invalid', text: 'drop this' },
      { type: 'pattern', text: 'keep this too' },
      'not-an-object',
    ])
  );

  assert.equal(parsed.length, 2);
  assert.equal(parsed[0].type, 'important');
  assert.equal(parsed[1].type, 'pattern');
});

test('parseAiAnnotations returns empty array for nullish, malformed, or non-array values', () => {
  assert.deepEqual(parseAiAnnotations(null), []);
  assert.deepEqual(parseAiAnnotations(undefined), []);
  assert.deepEqual(parseAiAnnotations('{"not":"array"}'), []);
  assert.deepEqual(parseAiAnnotations('{bad-json}'), []);
});

test('stringifyAiAnnotations keeps only valid annotation entries', () => {
  const result = stringifyAiAnnotations([
    { type: 'connection', text: 'valid' },
    { type: 'invalid', text: 'drop' },
    { type: 'unfinished', text: 'valid2', timestamp: 2 },
  ]);

  const parsed = JSON.parse(result) as Array<{ type: string; text: string }>;
  assert.equal(parsed.length, 2);
  assert.equal(parsed[0].type, 'connection');
  assert.equal(parsed[1].type, 'unfinished');
});

test('stringifyAiAnnotations returns empty array JSON for non-array input', () => {
  assert.equal(stringifyAiAnnotations('nope'), '[]');
});
