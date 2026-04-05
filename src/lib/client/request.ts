type JsonRequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
};

async function parseJsonBody<TResponse>(response: Response): Promise<TResponse | null> {
  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.toLowerCase().includes('application/json')) {
    return null;
  }

  return (await response.json()) as TResponse;
}

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

  const data = await parseJsonBody<TResponse>(response);
  return { ok: response.ok, status: response.status, data };
}
