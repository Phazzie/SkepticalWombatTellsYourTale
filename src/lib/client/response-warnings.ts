export function warnMalformedResponse(scope: string, expected: string, data: unknown) {
  if (process.env.NODE_ENV === 'production') {
    console.error(`[${scope}] malformed response`);
    return;
  }

  const shape =
    data && typeof data === 'object'
      ? Object.keys(data as Record<string, unknown>)
      : typeof data;

  console.warn(`[${scope}] expected ${expected}`, { shape });
}
