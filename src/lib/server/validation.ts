import { badRequest } from '@/lib/server/errors';

/**
 * Validates that a value is a string and optionally enforces trimmed length constraints.
 * Throws AppError(400) when validation fails.
 */
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

/**
 * Validates raw text without trimming.
 * Throws AppError(400) when validation fails.
 */
export function assertRawString(value: unknown, field: string, opts?: { min?: number; max?: number }) {
  if (typeof value !== 'string') {
    throw badRequest(`${field} must be a string`);
  }

  if (opts?.min !== undefined && value.length < opts.min) {
    throw badRequest(`${field} must be at least ${opts.min} characters`);
  }

  if (opts?.max !== undefined && value.length > opts.max) {
    throw badRequest(`${field} must be at most ${opts.max} characters`);
  }

  return value;
}

/**
 * Validates that a value is a boolean.
 * Throws AppError(400) when validation fails.
 */
export function assertBoolean(value: unknown, field: string): boolean {
  if (typeof value !== 'boolean') {
    throw badRequest(`${field} must be a boolean`);
  }
  return value;
}

/**
 * Validates an optional string field. Returns null for null/undefined.
 * Throws AppError(400) when validation fails.
 */
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
