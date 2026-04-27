import test from 'node:test';
import assert from 'node:assert/strict';
import { GET } from '../health/route';

test('GET /api/health returns valid status and checks response', async () => {
  const response = await GET();
  assert.ok([200, 503].includes(response.status));

  const data = (await response.json()) as {
    status: string;
    checks: Record<string, string>;
    timestamp: string;
  };
  assert.ok(['ok', 'degraded'].includes(data.status));
  assert.ok(data.checks);
});

test('GET /api/health includes timestamp in response', async () => {
  const response = await GET();
  const data = (await response.json()) as { timestamp: string };

  assert.ok(data.timestamp);
  assert.ok(new Date(data.timestamp).getTime() > 0);
});

test('GET /api/health includes database check in response', async () => {
  const response = await GET();
  const data = (await response.json()) as { checks: Record<string, string> };

  assert.ok(data.checks);
  assert.ok('database' in data.checks);
  assert.ok(['ok', 'error'].includes(data.checks.database));
});
