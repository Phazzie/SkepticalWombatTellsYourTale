import test from 'node:test';
import assert from 'node:assert/strict';
import { getCorrelationId, getIpAddress } from '@/lib/server/request-context';

test('getCorrelationId uses x-request-id header when provided', () => {
  const request = new Request('https://example.com', {
    headers: { 'x-request-id': 'req-123' },
  });
  assert.equal(getCorrelationId(request), 'req-123');
});

test('getCorrelationId generates UUID when request id missing', () => {
  const id = getCorrelationId();
  assert.match(id, /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
});

test('getIpAddress returns x-forwarded-for or unknown', () => {
  const request = new Request('https://example.com', {
    headers: { 'x-forwarded-for': '1.2.3.4' },
  });
  assert.equal(getIpAddress(request), '1.2.3.4');
  assert.equal(getIpAddress(), 'unknown');
});
