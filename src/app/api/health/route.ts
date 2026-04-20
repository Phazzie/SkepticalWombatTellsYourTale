import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  const checks: Record<string, 'ok' | 'error' | 'warning'> = {};

  // Critical checks — these determine overall health status
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = 'ok';
  } catch {
    checks.database = 'error';
  }

  checks.auth = process.env.NEXTAUTH_SECRET ? 'ok' : 'error';

  // Optional feature check — missing key degrades AI features but not core app
  checks.openai = process.env.OPENAI_API_KEY ? 'ok' : 'warning';

  const healthy = checks.database === 'ok' && checks.auth === 'ok';

  return NextResponse.json(
    { status: healthy ? 'ok' : 'degraded', checks, timestamp: new Date().toISOString() },
    { status: healthy ? 200 : 503 }
  );
}
