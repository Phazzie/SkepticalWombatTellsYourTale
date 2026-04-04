import test from 'node:test';
import assert from 'node:assert/strict';

function normalizeQuestionId(value: FormDataEntryValue | null) {
  return typeof value === 'string' && value ? value : undefined;
}

test('transcribe contract optional questionId normalization', () => {
  assert.equal(normalizeQuestionId(null), undefined);
  assert.equal(normalizeQuestionId(''), undefined);
  assert.equal(normalizeQuestionId('q1'), 'q1');
});
