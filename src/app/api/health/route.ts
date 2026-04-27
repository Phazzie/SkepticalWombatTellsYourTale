import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  const checks: Record<string, 'ok' | 'error'> = {};

  // Database check
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = 'ok';
  } catch {
    checks.database = 'error';
  }

  // Environment checks
  checks.auth = process.env.NEXTAUTH_SECRET ? 'ok' : 'error';
  checks.openai = process.env.OPENAI_API_KEY ? 'ok' : 'error';

  const healthy = Object.values(checks).every((v) => v === 'ok');

  return NextResponse.json(
    { status: healthy ? 'ok' : 'degraded', checks, timestamp: new Date().toISOString() },
    { status: healthy ? 200 : 503 }
  );
}
