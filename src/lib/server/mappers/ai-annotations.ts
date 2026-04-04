import { AIAnnotation } from '@/lib/types';
import { log } from '@/lib/server/logger';

const VALID_TYPES = ['important', 'connection', 'unfinished', 'tangent', 'pattern'] as const;

function isAnnotation(value: unknown): value is AIAnnotation {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Record<string, unknown>;
  const type = candidate.type;
  const text = candidate.text;
  const reference = candidate.reference;
  const timestamp = candidate.timestamp;

  return (
    typeof text === 'string' &&
    typeof type === 'string' &&
    VALID_TYPES.includes(type as (typeof VALID_TYPES)[number]) &&
    (reference === undefined || typeof reference === 'string') &&
    (timestamp === undefined || typeof timestamp === 'number')
  );
}

export function parseAiAnnotations(value: string | null | undefined): AIAnnotation[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isAnnotation);
  } catch (error) {
    log('warn', 'Failed to parse aiAnnotations JSON', { error: String(error) });
    return [];
  }
}

export function stringifyAiAnnotations(value: unknown): string {
  if (!Array.isArray(value)) return '[]';
  const normalized = value.filter(isAnnotation);
  return JSON.stringify(normalized);
}
