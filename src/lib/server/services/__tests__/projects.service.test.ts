import test from 'node:test';
import assert from 'node:assert/strict';
import { projectsService } from '@/lib/server/services/projects';
import { AppError } from '@/lib/server/errors';

test('createProject delegates to repository with same payload', async () => {
  let received: { userId: string; name: string; description: string | null } | null = null;

  const created = { id: 'p1', name: 'Test' };
  const repository = {
    async createForUser(userId: string, name: string, description: string | null) {
      received = { userId, name, description };
      return created;
    },
    async updateProject() {
      throw new Error('not used');
    },
    async deleteProject() {
      throw new Error('not used');
    },
  };

  const result = await projectsService.createProject('u1', 'Test', 'Desc', { repository });
  assert.deepEqual(received, { userId: 'u1', name: 'Test', description: 'Desc' });
  assert.equal(result, created);
});

test('updateProject requires access check before updating', async () => {
  let ensureCalled = false;
  let updated: { id: string; data: { name?: string; description?: string | null } } | null = null;

  const repository = {
    async createForUser() {
      throw new Error('not used');
    },
    async updateProject(id: string, data: { name?: string; description?: string | null }) {
      updated = { id, data };
      return { id, ...data };
    },
    async deleteProject() {
      throw new Error('not used');
    },
  };

  const ensureAccess = async () => {
    ensureCalled = true;
    return { userId: 'owner' };
  };

  await projectsService.updateProject('u1', 'p1', { name: 'Renamed' }, { repository, ensureAccess });
  assert.equal(ensureCalled, true);
  assert.deepEqual(updated, { id: 'p1', data: { name: 'Renamed' } });
});

test('deleteProject forbids non-owner users', async () => {
  let deleted = false;
  const repository = {
    async createForUser() {
      throw new Error('not used');
    },
    async updateProject() {
      throw new Error('not used');
    },
    async deleteProject() {
      deleted = true;
    },
  };

  const ensureAccess = async () => ({ userId: 'owner' });

  await assert.rejects(
    () => projectsService.deleteProject('member', 'p1', { repository, ensureAccess }),
    (error) => error instanceof AppError && error.status === 403 && error.message === 'Only project owner can delete project'
  );
  assert.equal(deleted, false);
});

test('deleteProject allows owner users', async () => {
  let deletedId: string | null = null;
  const repository = {
    async createForUser() {
      throw new Error('not used');
    },
    async updateProject() {
      throw new Error('not used');
    },
    async deleteProject(projectId: string) {
      deletedId = projectId;
    },
  };

  const ensureAccess = async () => ({ userId: 'owner' });

  const result = await projectsService.deleteProject('owner', 'p1', { repository, ensureAccess });
  assert.deepEqual(result, { success: true });
  assert.equal(deletedId, 'p1');
});
