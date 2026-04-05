import test from 'node:test';
import assert from 'node:assert/strict';
import { searchProject } from '@/lib/server/services/search.service';
import { SearchPersistencePort } from '@/lib/server/ports/search';

test('searchProject returns empty response for blank query without calling persistence', async () => {
  let called = false;
  const persistence: SearchPersistencePort = {
    async searchProject() {
      called = true;
      return [];
    },
  };

  const result = await searchProject('p1', '   ', { persistence });
  assert.equal(result.query, '');
  assert.deepEqual(result.results, []);
  assert.equal(called, false);
});

test('searchProject trims query and sorts results by createdAt desc', async () => {
  const older = new Date('2024-01-01T00:00:00.000Z');
  const newer = new Date('2024-01-02T00:00:00.000Z');
  let receivedQuery = '';

  const persistence: SearchPersistencePort = {
    async searchProject(_projectId, query) {
      receivedQuery = query;
      return [
        { kind: 'document', id: 'd1', title: 'Old', snippet: 'old', createdAt: older },
        { kind: 'question', id: 'q1', title: 'New', snippet: 'new', createdAt: newer },
      ];
    },
  };

  const result = await searchProject('p1', ' hello ', { persistence });
  assert.equal(receivedQuery, 'hello');
  assert.equal(result.query, 'hello');
  assert.equal(result.results[0].id, 'q1');
  assert.equal(result.results[1].id, 'd1');
});

test('searchProject surfaces persistence failures', async () => {
  const persistence: SearchPersistencePort = {
    async searchProject() {
      throw new Error('db unavailable');
    },
  };

  await assert.rejects(() => searchProject('p1', 'hello', { persistence }));
});
