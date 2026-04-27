import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getCorrelationId,
  getIpAddress,
  getRequestContext,
  runWithRequestContext,
} from '@/lib/server/request-context';

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

test('runWithRequestContext exposes context to nested calls', () => {
  const value = runWithRequestContext({ correlationId: 'ctx-1', path: '/api/test' }, () => {
    const context = getRequestContext();
    return context?.correlationId;
  });

  assert.equal(value, 'ctx-1');
});

test('getCorrelationId prefers async request context over request header', () => {
  const request = new Request('https://example.com', {
    headers: { 'x-request-id': 'req-override' },
  });

  const id = runWithRequestContext({ correlationId: 'ctx-2' }, () => getCorrelationId(request));
  assert.equal(id, 'ctx-2');
});

test('request context does not bleed across concurrent async operations', async () => {
  const [idA, idB] = await Promise.all([
    runWithRequestContext({ correlationId: 'ctx-a' }, async () => {
      await new Promise((resolve) => setTimeout(resolve, 5));
      return getRequestContext()?.correlationId;
    }),
    runWithRequestContext({ correlationId: 'ctx-b' }, async () => {
      await new Promise((resolve) => setTimeout(resolve, 1));
      return getRequestContext()?.correlationId;
    }),
  ]);

  assert.equal(idA, 'ctx-a');
  assert.equal(idB, 'ctx-b');
});
