import OpenAI from 'openai';

const DEFAULT_MAX_ATTEMPTS = 3;
const BASE_DELAY_MS = 500;
const DEFAULT_TIMEOUT_MS = 30_000;

function isTransientError(err: unknown): boolean {
  if (err instanceof OpenAI.APIConnectionError) return true;
  if (err instanceof OpenAI.APIConnectionTimeoutError) return true;
  if (err instanceof OpenAI.RateLimitError) return true;
  if (err instanceof OpenAI.InternalServerError) return true;
  return false;
}

/**
 * Wraps an async function with exponential-backoff retry and a per-attempt timeout.
 * The fn receives an AbortSignal that is cancelled on timeout; pass it to the OpenAI SDK
 * call (second argument) so the underlying HTTP request is properly cancelled.
 * Only transient errors (network, 429, 5xx) are retried; non-transient 4xx errors
 * are propagated immediately.
 *
 * @example
 * withRetry((signal) => openai.chat.completions.create({...}, { signal }))
 */
export async function withRetry<T>(
  fn: (signal?: AbortSignal) => Promise<T>,
  options?: { maxAttempts?: number; timeoutMs?: number }
): Promise<T> {
  const maxAttempts = options?.maxAttempts ?? DEFAULT_MAX_ATTEMPTS;
  const timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const result = await fn(controller.signal);
      clearTimeout(timer);
      return result;
    } catch (err) {
      clearTimeout(timer);

      if (controller.signal.aborted) {
        // Our own timeout fired — treat as transient and allow retry
        lastError = new Error(`AI call timed out after ${timeoutMs}ms`);
      } else if (!isTransientError(err)) {
        // Non-transient error (e.g. 400, 401, 403) — fail immediately
        throw err;
      } else {
        lastError = err;
      }

      if (attempt < maxAttempts) {
        await new Promise<void>((r) => setTimeout(r, BASE_DELAY_MS * 2 ** (attempt - 1)));
      }
    }
  }

  throw lastError;
}
