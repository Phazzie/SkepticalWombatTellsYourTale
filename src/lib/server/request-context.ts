import { randomUUID } from 'node:crypto';

export function getCorrelationId(request?: Request) {
  return request?.headers.get('x-request-id') || randomUUID();
}

export function getIpAddress(request?: Request) {
  return request?.headers.get('x-forwarded-for') || 'unknown';
}
