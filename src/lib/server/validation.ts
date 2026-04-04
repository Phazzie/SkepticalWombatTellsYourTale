import { badRequest } from '@/lib/server/errors';

export function assertString(value: unknown, field: string, opts?: { min?: number; max?: number }) {
  if (typeof value !== 'string') {
    throw badRequest(`${field} must be a string`);
  }

  const trimmed = value.trim();
  if (opts?.min !== undefined && trimmed.length < opts.min) {
    throw badRequest(`${field} must be at least ${opts.min} characters`);
  }

  if (opts?.max !== undefined && trimmed.length > opts.max) {
    throw badRequest(`${field} must be at most ${opts.max} characters`);
  }

  return trimmed;
}

export function assertBoolean(value: unknown, field: string): boolean {
  if (typeof value !== 'boolean') {
    throw badRequest(`${field} must be a boolean`);
  }
  return value;
}

export function asOptionalString(value: unknown, field: string, opts?: { max?: number }) {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value !== 'string') {
    throw badRequest(`${field} must be a string`);
  }

  const trimmed = value.trim();
  if (opts?.max !== undefined && trimmed.length > opts.max) {
    throw badRequest(`${field} must be at most ${opts.max} characters`);
  }

  return trimmed;
}
