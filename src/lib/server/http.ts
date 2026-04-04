import { NextResponse } from 'next/server';
import { AppError } from '@/lib/server/errors';
import { getCorrelationId } from '@/lib/server/request-context';
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

    return NextResponse.json(
      {
        error: error.message,
        ...(error.details !== undefined ? { details: error.details } : {}),
        correlationId,
      },
      { status: error.status }
    );
  }

  log('error', 'Request failed with unexpected error', {
    operation: context?.operation,
    correlationId,
    error: error instanceof Error ? error.message : String(error),
  });

  return NextResponse.json(
    { error: 'Internal server error', correlationId },
    { status: 500 }
  );
}

export async function handleRoute<T>(fn: () => Promise<T>, context?: { request?: Request; operation?: string }) {
  try {
    const data = await fn();
    if (data instanceof Response) {
      return data;
    }
    return ok(data);
  } catch (error) {
    return fail(error, context);
  }
}
