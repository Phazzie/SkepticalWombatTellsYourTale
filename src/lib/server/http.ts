import { NextResponse } from 'next/server';
import { AppError } from '@/lib/server/errors';
import { getCorrelationId, runWithRequestContext } from '@/lib/server/request-context';
import { log } from '@/lib/server/logger';

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

export function fail(error: unknown, context?: { request?: Request; operation?: string }) {
  const correlationId = getCorrelationId(context?.request);

  if (error instanceof AppError) {
    log('warn', 'Request failed with app error', {
      operation: context?.operation,
      correlationId,
      status: error.status,
      message: error.message,
    });

    const response = NextResponse.json(
      {
        error: error.message,
        ...(error.details !== undefined ? { details: error.details } : {}),
        correlationId,
      },
      { status: error.status }
    );
    response.headers.set('X-Correlation-Id', correlationId);
    return response;
  }

  log('error', 'Request failed with unexpected error', {
    operation: context?.operation,
    correlationId,
    error: error instanceof Error ? error.message : String(error),
  });

  const response = NextResponse.json(
    { error: 'Internal server error', correlationId },
    { status: 500 }
  );
  response.headers.set('X-Correlation-Id', correlationId);
  return response;
}

export async function handleRoute<T>(fn: () => Promise<T>, context?: { request?: Request; operation?: string }) {
  const correlationId = getCorrelationId(context?.request);
  return runWithRequestContext(
    {
      correlationId,
      path: context?.request ? new URL(context.request.url).pathname : undefined,
    },
    async () => {
      try {
        const data = await fn();
        if (data instanceof Response) {
          data.headers.set('X-Correlation-Id', correlationId);
          return data;
        }
        const response = ok(data);
        response.headers.set('X-Correlation-Id', correlationId);
        return response;
      } catch (error) {
        return fail(error, context);
      }
    }
  );
}
