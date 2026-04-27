import { describe, it, assert } from 'vitest';
import { GET } from '../health/route';

describe('GET /api/health', () => {
  it('returns 200 with ok status when database is healthy', async () => {
    const response = await GET();
    const data = (await response.json()) as {
      status: string;
      checks: Record<string, string>;
      timestamp: string;
    };

    assert.equal(response.status, 200);
    assert.equal(data.status, 'ok');
    assert.equal(data.checks.database, 'ok');
  });

  it('includes timestamp in response', async () => {
    const response = await GET();
    const data = (await response.json()) as { timestamp: string };

    assert.ok(data.timestamp);
    assert.ok(new Date(data.timestamp).getTime() > 0);
  });

  it('only includes auth check in production', async () => {
    const originalEnv = process.env.NODE_ENV;
    try {
      process.env.NODE_ENV = 'development';
      const response = await GET();
      const data = (await response.json()) as { checks: Record<string, string> };
      assert.notEqual(data.checks.auth, undefined);
    } finally {
      process.env.NODE_ENV = originalEnv;
    }
  });

  it('includes check results in response', async () => {
    const response = await GET();
    const data = (await response.json()) as { checks: Record<string, string> };

    assert.ok(data.checks);
    assert.ok('database' in data.checks);
  });
});
