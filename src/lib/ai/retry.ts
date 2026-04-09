const DEFAULT_MAX_ATTEMPTS = 3;
const BASE_DELAY_MS = 500;
const DEFAULT_TIMEOUT_MS = 30_000;

/**
 * Wraps an async function with exponential-backoff retry and a per-attempt timeout.
 * Use this around all OpenAI SDK calls to handle transient network and rate-limit errors.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options?: { maxAttempts?: number; timeoutMs?: number }
): Promise<T> {
  const maxAttempts = options?.maxAttempts ?? DEFAULT_MAX_ATTEMPTS;
  const timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await Promise.race([
        fn(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error(`AI call timed out after ${timeoutMs}ms`)), timeoutMs)
        ),
      ]);
    } catch (err) {
      lastError = err;
      if (attempt < maxAttempts) {
        await new Promise<void>((r) => setTimeout(r, BASE_DELAY_MS * 2 ** (attempt - 1)));
      }
    }
  }

  throw lastError;
}
