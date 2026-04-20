import { getRequestContext } from '@/lib/server/request-context';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export function log(level: LogLevel, message: string, context?: Record<string, unknown>) {
  const requestContext = getRequestContext();
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...(requestContext?.correlationId ? { correlationId: requestContext.correlationId } : {}),
    ...(requestContext?.userId ? { userId: requestContext.userId } : {}),
    ...(requestContext?.path ? { path: requestContext.path } : {}),
    ...(context ? { context } : {}),
  };

  const serialized = JSON.stringify(entry);
  if (level === 'error') {
    console.error(serialized);
    return;
  }
  if (level === 'warn') {
    console.warn(serialized);
    return;
  }
  console.log(serialized);
}
