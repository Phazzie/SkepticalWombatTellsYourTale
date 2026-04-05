type JsonRequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
};

export async function requestJson<TResponse>(input: RequestInfo | URL, init: JsonRequestOptions = {}) {
  const { body, headers, ...rest } = init;
  const hasBody = body !== undefined;

  const response = await fetch(input, {
    ...rest,
    headers: {
      ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
      ...(headers || {}),
    },
    body: hasBody ? JSON.stringify(body) : undefined,
  });

  const data = (await response.json()) as TResponse;
  return { ok: response.ok, status: response.status, data };
}
