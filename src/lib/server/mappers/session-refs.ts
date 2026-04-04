import { log } from '@/lib/server/logger';

export function parseSessionRefs(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((entry): entry is string => typeof entry === 'string');
  } catch (error) {
    log('warn', 'Failed to parse sessionRefs JSON', { error: String(error) });
    return [];
  }
}

export function stringifySessionRefs(value: unknown): string {
  if (!Array.isArray(value)) return '[]';
  const normalized = value.filter((entry): entry is string => typeof entry === 'string');
  return JSON.stringify(normalized);
}
