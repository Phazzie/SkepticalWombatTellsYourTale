export function warnMalformedResponse(scope: string, expected: string, data: unknown) {
  const isProduction = process.env.NODE_ENV === 'production';
  const shape =
    data && typeof data === 'object'
      ? Object.keys(data as Record<string, unknown>)
      : typeof data;

  if (isProduction) {
    console.error(`[${scope}] expected ${expected}`);
    return;
  }

  console.error(`[${scope}] expected ${expected}`, { shape });
}
