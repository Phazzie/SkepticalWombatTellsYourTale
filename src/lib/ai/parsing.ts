import { log } from '@/lib/server/logger';

export function parseAiJsonObject<T>(params: {
  content: string | null | undefined;
  fallback: T;
  label: string;
  normalize?: (value: unknown) => T;
}): T {
  const { content, fallback, label, normalize } = params;
  if (!content) {
    log('warn', 'AI response missing content', { label });
    return fallback;
  }

  try {
    const parsed = JSON.parse(content);
    if (normalize) {
      return normalize(parsed);
    }
    return parsed as T;
  } catch (error) {
    log('warn', 'AI response parse failed', { label, error: String(error) });
    return fallback;
  }
}

function asString(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback;
}

export function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((entry): entry is string => typeof entry === 'string');
}

export function asObject(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

export function safeString(value: unknown, fallback = '') {
  return asString(value, fallback);
}
