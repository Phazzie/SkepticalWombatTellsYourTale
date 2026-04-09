import test from 'node:test';
import assert from 'node:assert/strict';
import { POST as registerPOST } from '@/app/api/auth/register/route';
import { POST as questionsPOST } from '@/app/api/projects/[id]/questions/route';
import { POST as transcribePOST } from '@/app/api/transcribe/route';
import { GET as sessionsGET, POST as sessionsPOST } from '@/app/api/projects/[id]/sessions/route';
import { GET as documentsGET, POST as documentsPOST } from '@/app/api/projects/[id]/documents/route';
import { POST as exportPOST } from '@/app/api/projects/[id]/export/route';

test('auth/register returns 400 error shape for malformed JSON', async () => {
  const response = await registerPOST(new Request('http://localhost/api/auth/register', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-request-id': 'register-malformed-json',
      'x-forwarded-for': 'test-register-malformed',
    },
    body: '{"email"',
  }));
  const payload = await response.json();

  assert.equal(response.status, 400);
  assert.equal(payload.error, 'Invalid or missing JSON request body');
  assert.equal(payload.correlationId, 'register-malformed-json');
});

test('projects/questions returns 401 with standard error payload when unauthenticated', async () => {
  const response = await questionsPOST(
    new Request('http://localhost/api/projects/p1/questions', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-request-id': 'questions-malformed-json',
      },
      body: '{',
    }),
    { params: Promise.resolve({ id: 'p1' }) }
  );
  const payload = await response.json();

  assert.equal(response.status, 401);
  assert.equal(payload.error, 'Unauthorized');
  assert.equal(payload.correlationId, 'questions-malformed-json');
});

test('transcribe returns 401 when unauthenticated (even if upload fields are missing)', async () => {
  const formData = new FormData();
  const response = await transcribePOST(new Request('http://localhost/api/transcribe', {
    method: 'POST',
    headers: { 'x-request-id': 'transcribe-missing-fields' },
    body: formData,
  }));
  const payload = await response.json();

  assert.equal(response.status, 401);
  assert.equal(payload.error, 'Unauthorized');
  assert.equal(payload.correlationId, 'transcribe-missing-fields');
});

test('transcribe enforces auth boundary before MIME validation for non-empty uploads', async () => {
  const formData = new FormData();
  formData.set('projectId', 'p1');
  formData.set('audio', new File(['hello'], 'audio.txt', { type: 'text/plain' }));

  const response = await transcribePOST(new Request('http://localhost/api/transcribe', {
    method: 'POST',
    headers: { 'x-request-id': 'transcribe-unsupported-mime' },
    body: formData,
  }));
  const payload = await response.json();

  assert.equal(response.status, 401);
  assert.equal(payload.error, 'Unauthorized');
  assert.equal(payload.correlationId, 'transcribe-unsupported-mime');
});

test('transcribe returns 401 with standard error payload when upload is valid but user is unauthenticated', async () => {
  const formData = new FormData();
  formData.set('projectId', 'p1');
  formData.set('audio', new File(['hello'], 'audio.webm', { type: 'audio/webm' }));

  const response = await transcribePOST(new Request('http://localhost/api/transcribe', {
    method: 'POST',
    headers: { 'x-request-id': 'transcribe-unauthorized' },
    body: formData,
  }));
  const payload = await response.json();

  assert.equal(response.status, 401);
  assert.equal(payload.error, 'Unauthorized');
  assert.equal(payload.correlationId, 'transcribe-unauthorized');
});

test('projects/sessions GET returns 401 with standard error payload when unauthenticated', async () => {
  const response = await sessionsGET(
    new Request('http://localhost/api/projects/p1/sessions', {
      method: 'GET',
      headers: { 'x-request-id': 'sessions-get-unauthorized' },
    }),
    { params: Promise.resolve({ id: 'p1' }) }
  );
  const payload = await response.json();

  assert.equal(response.status, 401);
  assert.equal(payload.error, 'Unauthorized');
  assert.equal(payload.correlationId, 'sessions-get-unauthorized');
});

test('projects/sessions POST returns 401 with standard error payload when unauthenticated', async () => {
  const response = await sessionsPOST(
    new Request('http://localhost/api/projects/p1/sessions', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-request-id': 'sessions-post-unauthorized',
      },
      body: JSON.stringify({ transcript: 'hello', aiAnnotations: [] }),
    }),
    { params: Promise.resolve({ id: 'p1' }) }
  );
  const payload = await response.json();

  assert.equal(response.status, 401);
  assert.equal(payload.error, 'Unauthorized');
  assert.equal(payload.correlationId, 'sessions-post-unauthorized');
});

test('projects/documents GET returns 401 with standard error payload when unauthenticated', async () => {
  const response = await documentsGET(
    new Request('http://localhost/api/projects/p1/documents', {
      method: 'GET',
      headers: { 'x-request-id': 'documents-get-unauthorized' },
    }),
    { params: Promise.resolve({ id: 'p1' }) }
  );
  const payload = await response.json();

  assert.equal(response.status, 401);
  assert.equal(payload.error, 'Unauthorized');
  assert.equal(payload.correlationId, 'documents-get-unauthorized');
});

test('projects/documents POST returns 401 with standard error payload when unauthenticated', async () => {
  const response = await documentsPOST(
    new Request('http://localhost/api/projects/p1/documents', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-request-id': 'documents-post-unauthorized',
      },
      body: JSON.stringify({ name: 'Doc', type: 'general' }),
    }),
    { params: Promise.resolve({ id: 'p1' }) }
  );
  const payload = await response.json();

  assert.equal(response.status, 401);
  assert.equal(payload.error, 'Unauthorized');
  assert.equal(payload.correlationId, 'documents-post-unauthorized');
});

test('projects/export POST returns 401 with standard error payload when unauthenticated', async () => {
  const response = await exportPOST(
    new Request('http://localhost/api/projects/p1/export', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-request-id': 'export-post-unauthorized',
      },
      body: JSON.stringify({ level: 'full' }),
    }),
    { params: Promise.resolve({ id: 'p1' }) }
  );
  const payload = await response.json();

  assert.equal(response.status, 401);
  assert.equal(payload.error, 'Unauthorized');
  assert.equal(payload.correlationId, 'export-post-unauthorized');
});
