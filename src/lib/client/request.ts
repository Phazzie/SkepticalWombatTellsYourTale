type JsonRequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
};

/**
 * Performs a JSON request with optional JSON body and typed JSON response.
 * Returns `{ ok, status, data }` so callers can preserve existing fetch-style
 * status handling while avoiding repeated JSON/header boilerplate.
 */
export async function requestJson<TResponse>(input: RequestInfo | URL, init: JsonRequestOptions = {}) {
  const { body, headers, ...rest } = init;
  const hasBody = body !== undefined;
  const normalizedHeaders = new Headers(headers);

  if (hasBody && !normalizedHeaders.has('Content-Type')) {
    normalizedHeaders.set('Content-Type', 'application/json');
  }

  const response = await fetch(input, {
    ...rest,
    headers: normalizedHeaders,
    body: hasBody ? JSON.stringify(body) : undefined,
  });

  const data = (await response.json()) as TResponse;
  return { ok: response.ok, status: response.status, data };
}
