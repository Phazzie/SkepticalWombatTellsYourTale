import { badRequest } from '@/lib/server/errors';

const TRUTHY_INCLUDE_FLAG_VALUES = new Set(['true', '1']);
const FALSY_INCLUDE_FLAG_VALUES = new Set(['false', '0']);
export const EXPORT_FLAG_ERROR_MESSAGE = 'must be a boolean-like value (true/false or 1/0)';

export function parseExportIncludeFlag(value: unknown, field: string): boolean {
  if (value === undefined || value === null) {
    return false;
  }
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'number') {
    if (value === 1) {
      return true;
    }
    if (value === 0) {
      return false;
    }
    throw badRequest(`${field} ${EXPORT_FLAG_ERROR_MESSAGE}`);
  }
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (TRUTHY_INCLUDE_FLAG_VALUES.has(normalized)) {
      return true;
    }
    if (FALSY_INCLUDE_FLAG_VALUES.has(normalized)) {
      return false;
    }
    throw badRequest(`${field} ${EXPORT_FLAG_ERROR_MESSAGE}`);
  }
  throw badRequest(`${field} ${EXPORT_FLAG_ERROR_MESSAGE}`);
}
