export function getCorrelationId(request?: Request) {
  return request?.headers.get('x-request-id') || crypto.randomUUID();
}

export function getIpAddress(request?: Request) {
  return request?.headers.get('x-forwarded-for') || 'unknown';
}
