import test from 'node:test';
import assert from 'node:assert/strict';
import { requireProjectAccess } from '@/lib/server/services/project-access';
import * as authModule from '@/lib/server/auth';

test('requireProjectAccess delegates to ensureProjectAccess', async () => {
  const original = authModule.ensureProjectAccess;
  let seenProjectId = '';
  let seenUserId = '';

  authModule.ensureProjectAccess = (async (projectId: string, userId: string) => {
    seenProjectId = projectId;
    seenUserId = userId;
  }) as typeof authModule.ensureProjectAccess;

  try {
    await requireProjectAccess('p1', 'u1');
    assert.equal(seenProjectId, 'p1');
    assert.equal(seenUserId, 'u1');
  } finally {
    authModule.ensureProjectAccess = original;
  }
});
