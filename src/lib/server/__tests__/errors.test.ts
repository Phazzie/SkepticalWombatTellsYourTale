import test from 'node:test';
import assert from 'node:assert/strict';
import {
  AppError,
  badRequest,
  forbidden,
  internalError,
  notFound,
  unauthorized,
} from '@/lib/server/errors';

test('AppError sets name, message, status, and details', () => {
  const error = new AppError(418, 'I am a teapot', { hint: 'brew' });
  assert.equal(error.name, 'AppError');
  assert.equal(error.message, 'I am a teapot');
  assert.equal(error.status, 418);
  assert.deepEqual(error.details, { hint: 'brew' });
});

test('AppError is an instance of Error', () => {
  const error = new AppError(500, 'boom');
  assert.ok(error instanceof Error);
  assert.ok(error instanceof AppError);
});

test('AppError without details has undefined details', () => {
  const error = new AppError(400, 'oops');
  assert.equal(error.details, undefined);
});

test('badRequest creates AppError with status 400', () => {
  const error = badRequest('bad input');
  assert.ok(error instanceof AppError);
  assert.equal(error.status, 400);
  assert.equal(error.message, 'bad input');
  assert.equal(error.details, undefined);
});

test('badRequest includes optional details', () => {
  const error = badRequest('invalid field', { field: 'email' });
  assert.equal(error.status, 400);
  assert.deepEqual(error.details, { field: 'email' });
});

test('unauthorized creates AppError with status 401 and default message', () => {
  const error = unauthorized();
  assert.ok(error instanceof AppError);
  assert.equal(error.status, 401);
  assert.equal(error.message, 'Unauthorized');
});

test('unauthorized accepts a custom message', () => {
  const error = unauthorized('Token expired');
  assert.equal(error.status, 401);
  assert.equal(error.message, 'Token expired');
});

test('forbidden creates AppError with status 403 and default message', () => {
  const error = forbidden();
  assert.ok(error instanceof AppError);
  assert.equal(error.status, 403);
  assert.equal(error.message, 'Forbidden');
});

test('forbidden accepts a custom message', () => {
  const error = forbidden('No access to this resource');
  assert.equal(error.status, 403);
  assert.equal(error.message, 'No access to this resource');
});

test('notFound creates AppError with status 404 and default message', () => {
  const error = notFound();
  assert.ok(error instanceof AppError);
  assert.equal(error.status, 404);
  assert.equal(error.message, 'Not found');
});

test('notFound accepts a custom message', () => {
  const error = notFound('Project not found');
  assert.equal(error.status, 404);
  assert.equal(error.message, 'Project not found');
});

test('internalError creates AppError with status 500 and default message', () => {
  const error = internalError();
  assert.ok(error instanceof AppError);
  assert.equal(error.status, 500);
  assert.equal(error.message, 'Internal server error');
});

test('internalError accepts a custom message', () => {
  const error = internalError('Database connection failed');
  assert.equal(error.status, 500);
  assert.equal(error.message, 'Database connection failed');
});
