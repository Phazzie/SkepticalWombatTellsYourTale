import { NextResponse } from 'next/server';
import { AppError } from '@/lib/server/errors';

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

export function fail(error: unknown) {
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: error.message,
        ...(error.details !== undefined ? { details: error.details } : {}),
      },
      { status: error.status }
    );
  }

  console.error(error);
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
}

export async function handleRoute<T>(fn: () => Promise<T>) {
  try {
    const data = await fn();
    if (data instanceof Response) {
      return data;
    }
    return ok(data);
  } catch (error) {
    return fail(error);
  }
}
