import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import type { HealthResponse } from '@/lib/types/health';

export async function GET(): Promise<NextResponse<HealthResponse>> {
  let databaseOk = false;
  try {
    await prisma.$queryRaw`SELECT 1`;
    databaseOk = true;
  } catch {
    databaseOk = false;
  }

  const depsOk = process.env.NEXTAUTH_SECRET && process.env.OPENAI_API_KEY;

  const checks = {
    database: databaseOk ? ('ok' as const) : ('error' as const),
    dependencies: depsOk ? ('ok' as const) : ('error' as const),
  };

  const healthy = Object.values(checks).every((value) => value === 'ok');

  return NextResponse.json(
    {
      status: healthy ? 'ok' : 'degraded',
      checks,
      timestamp: new Date().toISOString(),
    } as HealthResponse,
    { status: healthy ? 200 : 503 }
  );
}
