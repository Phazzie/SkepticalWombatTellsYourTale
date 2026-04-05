import test from 'node:test';
import assert from 'node:assert/strict';
import { AppError } from '@/lib/server/errors';
import { fail, handleRoute, ok } from '@/lib/server/http';

test('ok returns JSON response with payload and status', async () => {
  const response = ok({ hello: 'world' }, { status: 201 });
  assert.equal(response.status, 201);
  const body = await response.json();
  assert.deepEqual(body, { hello: 'world' });
});

test('fail converts AppError into JSON with status and details', async () => {
  const request = new Request('https://example.com', {
    headers: { 'x-request-id': 'req-1' },
  });

  const response = fail(new AppError(404, 'Missing', { field: 'id' }), { request, operation: 'test' });
  assert.equal(response.status, 404);
  const body = await response.json();
  assert.equal(body.error, 'Missing');
  assert.deepEqual(body.details, { field: 'id' });
  assert.equal(body.correlationId, 'req-1');
});

test('fail converts unknown error to internal server error shape', async () => {
  const request = new Request('https://example.com', {
    headers: { 'x-request-id': 'req-2' },
  });

  const response = fail(new Error('boom'), { request, operation: 'test' });
  assert.equal(response.status, 500);
  const body = await response.json();
  assert.equal(body.error, 'Internal server error');
  assert.equal(body.correlationId, 'req-2');
});

test('handleRoute wraps non-Response result in JSON response', async () => {
  const response = await handleRoute(async () => ({ ok: true }));
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.deepEqual(body, { ok: true });
});

test('handleRoute passes through Response results unchanged', async () => {
  const passThrough = new Response('raw', { status: 202 });
  const response = await handleRoute(async () => passThrough);
  assert.equal(response, passThrough);
  assert.equal(response.status, 202);
  assert.equal(await response.text(), 'raw');
});

test('handleRoute catches thrown errors via fail', async () => {
  const request = new Request('https://example.com', {
    headers: { 'x-request-id': 'req-3' },
  });

  const response = await handleRoute(
    async () => {
      throw new AppError(400, 'Bad input');
    },
    { request, operation: 'op' }
  );

  assert.equal(response.status, 400);
  const body = await response.json();
  assert.equal(body.error, 'Bad input');
  assert.equal(body.correlationId, 'req-3');
});
