import { randomUUID } from 'node:crypto';
import { AsyncLocalStorage } from 'node:async_hooks';

export interface RequestContext {
  correlationId: string;
  userId?: string;
  path?: string;
}

const requestContextStore = new AsyncLocalStorage<RequestContext>();

export function runWithRequestContext<T>(context: RequestContext, fn: () => T): T {
  return requestContextStore.run(context, fn);
}

export function getRequestContext() {
  return requestContextStore.getStore();
}

export function getCorrelationId(request?: Request) {
  return getRequestContext()?.correlationId || request?.headers.get('x-request-id') || randomUUID();
}

export function getIpAddress(request?: Request) {
  return request?.headers.get('x-forwarded-for') || 'unknown';
}
