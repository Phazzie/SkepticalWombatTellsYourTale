import test from 'node:test';
import assert from 'node:assert/strict';
import { requireProjectAccess } from '@/lib/server/services/project-access';

test('requireProjectAccess delegates to ensureProjectAccess', async () => {
  let seenProjectId = '';
  let seenUserId = '';

  const ensureProjectAccess = async (projectId: string, userId: string): Promise<void> => {
    seenProjectId = projectId;
    seenUserId = userId;
  };

  await requireProjectAccess('p1', 'u1', { ensureProjectAccess });
  assert.equal(seenProjectId, 'p1');
  assert.equal(seenUserId, 'u1');
});
