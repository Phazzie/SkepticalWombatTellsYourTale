import test from 'node:test';
import assert from 'node:assert/strict';
import { AppError } from '@/lib/server/errors';
import { EXPORT_FLAG_ERROR_MESSAGE, parseExportIncludeFlag } from '@/lib/server/routes/export';

test('parseExportIncludeFlag accepts supported boolean-like values', () => {
  assert.equal(parseExportIncludeFlag(true, 'includeTranscripts'), true);
  assert.equal(parseExportIncludeFlag(false, 'includeTranscripts'), false);
  assert.equal(parseExportIncludeFlag(1, 'includeTranscripts'), true);
  assert.equal(parseExportIncludeFlag(0, 'includeTranscripts'), false);
  assert.equal(parseExportIncludeFlag('true', 'includeTranscripts'), true);
  assert.equal(parseExportIncludeFlag('TRUE', 'includeTranscripts'), true);
  assert.equal(parseExportIncludeFlag(' true ', 'includeTranscripts'), true);
  assert.equal(parseExportIncludeFlag('1', 'includeTranscripts'), true);
  assert.equal(parseExportIncludeFlag('false', 'includeTranscripts'), false);
  assert.equal(parseExportIncludeFlag('FALSE', 'includeTranscripts'), false);
  assert.equal(parseExportIncludeFlag(' 0 ', 'includeTranscripts'), false);
  assert.equal(parseExportIncludeFlag('0', 'includeTranscripts'), false);
  assert.equal(parseExportIncludeFlag(undefined, 'includeTranscripts'), false);
  assert.equal(parseExportIncludeFlag(null, 'includeTranscripts'), false);
});

test('parseExportIncludeFlag rejects unsupported values with AppError(400)', () => {
  assert.throws(
    () => parseExportIncludeFlag('yes', 'includeTranscripts'),
    (error: unknown) => {
      assert.ok(error instanceof AppError);
      assert.equal(error.status, 400);
      assert.equal(error.message, `includeTranscripts ${EXPORT_FLAG_ERROR_MESSAGE}`);
      return true;
    }
  );

  assert.throws(
    () => parseExportIncludeFlag(2, 'includeTranscripts'),
    (error: unknown) => {
      assert.ok(error instanceof AppError);
      assert.equal(error.status, 400);
      assert.equal(error.message, `includeTranscripts ${EXPORT_FLAG_ERROR_MESSAGE}`);
      return true;
    }
  );
});
