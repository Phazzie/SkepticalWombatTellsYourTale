import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

type HealthCheckStatus = 'ok' | 'error' | 'warning';

interface HealthResponse {
  status: 'ok' | 'degraded';
  checks: Record<string, HealthCheckStatus>;
  timestamp: string;
}

export async function GET(): Promise<NextResponse<HealthResponse>> {
  const checks: Record<string, HealthCheckStatus> = {};

  // Critical check: database
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = 'ok';
  } catch {
    checks.database = 'error';
  }

  // Critical check: auth configuration
  checks.auth = process.env.NEXTAUTH_SECRET ? 'ok' : 'error';

  // Optional feature check: OpenAI integration (missing key degrades AI features but not core app)
  checks.openai = process.env.OPENAI_API_KEY ? 'ok' : 'warning';

  // Overall health determined by critical checks only
  const healthy = checks.database === 'ok' && checks.auth === 'ok';

  return NextResponse.json(
    { status: healthy ? 'ok' : 'degraded', checks, timestamp: new Date().toISOString() },
    { status: healthy ? 200 : 503 }
  );
}
