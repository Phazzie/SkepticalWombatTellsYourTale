import test from 'node:test';
import assert from 'node:assert/strict';
import { requestJson } from '@/lib/client/request';

test('requestJson sets JSON content type and stringifies body', async () => {
  let capturedInit: RequestInit | undefined;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (_input, init) => {
    capturedInit = init;
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  };

  try {
    const result = await requestJson<{ ok: boolean }>('/api/test', {
      method: 'POST',
      body: { hello: 'world' },
    });

    assert.equal(result.ok, true);
    assert.equal(result.status, 200);
    assert.deepEqual(result.data, { ok: true });
    assert.equal((capturedInit?.headers as Headers).get('Content-Type'), 'application/json');
    assert.equal(capturedInit?.body, JSON.stringify({ hello: 'world' }));
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('requestJson returns null data for 204 responses', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(null, { status: 204 });

  try {
    const result = await requestJson('/api/no-content', { method: 'PATCH' });
    assert.equal(result.ok, true);
    assert.equal(result.status, 204);
    assert.equal(result.data, null);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('requestJson returns null data for non-json responses', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () =>
    new Response('plain text', {
      status: 200,
      headers: { 'content-type': 'text/plain' },
    });

  try {
    const result = await requestJson('/api/text');
    assert.equal(result.ok, true);
    assert.equal(result.status, 200);
    assert.equal(result.data, null);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
