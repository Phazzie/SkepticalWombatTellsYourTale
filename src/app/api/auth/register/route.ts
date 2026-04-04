import { prisma } from '@/lib/db';
import { hashPassword } from '@/lib/auth/password';
import { handleRoute } from '@/lib/server/http';
import { badRequest } from '@/lib/server/errors';
import { assertString } from '@/lib/server/validation';
import { enforceRateLimit } from '@/lib/server/rate-limit';

export async function POST(request: Request) {
  return handleRoute(async () => {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    enforceRateLimit(`register:${ip}`, 10, 60_000);

    const body = (await request.json()) as { email?: unknown; password?: unknown; name?: unknown };
    const email = assertString(body.email, 'email', { min: 3, max: 200 }).toLowerCase();
    const password = assertString(body.password, 'password', { min: 8, max: 200 });
    const name = typeof body.name === 'string' ? body.name.trim() : null;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw badRequest('email must be a valid email address');
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw badRequest('Email is already registered');
    }

    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash: hashPassword(password),
      },
      select: { id: true, email: true, name: true },
    });

    return user;
  });
}
