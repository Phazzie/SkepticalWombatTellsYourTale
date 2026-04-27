import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  const checks: Record<string, 'ok' | 'error'> = {};

  // Database check (critical service)
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = 'ok';
  } catch {
    checks.database = 'error';
  }

  // Optional service checks (only in development for debugging)
  if (process.env.NODE_ENV === 'development') {
    checks.auth = process.env.NEXTAUTH_SECRET ? 'ok' : 'error';
    checks.openai = process.env.OPENAI_API_KEY ? 'ok' : 'error';
  }

  const healthy = checks.database === 'ok';

  return NextResponse.json(
    { status: healthy ? 'ok' : 'degraded', checks, timestamp: new Date().toISOString() },
    { status: healthy ? 200 : 503 }
  );
}
