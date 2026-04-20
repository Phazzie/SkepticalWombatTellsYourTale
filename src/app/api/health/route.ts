import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

type HealthCheckStatus = 'ok' | 'error';

export async function GET() {
  const checks: Record<'database' | 'auth' | 'openai', HealthCheckStatus> = {
    database: 'error',
    auth: process.env.NEXTAUTH_SECRET ? 'ok' : 'error',
    openai: process.env.OPENAI_API_KEY ? 'ok' : 'error',
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = 'ok';
  } catch {
    checks.database = 'error';
  }

  const healthy = Object.values(checks).every((value) => value === 'ok');

  return NextResponse.json(
    {
      status: healthy ? 'ok' : 'degraded',
      checks,
      timestamp: new Date().toISOString(),
    },
    { status: healthy ? 200 : 503 }
  );
}
