import { hashPassword } from '@/lib/auth/password';
import { handleRoute } from '@/lib/server/http';
import { badRequest } from '@/lib/server/errors';
import { asOptionalString, assertString, parseJsonBody } from '@/lib/server/validation';
import { enforceRateLimit } from '@/lib/server/rate-limit';
import { usersRepository } from '@/lib/server/repositories/users';

export async function POST(request: Request) {
  return handleRoute(async () => {
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ip = forwardedFor?.split(',')[0]?.trim() || 'unknown';
    enforceRateLimit(`register:${ip}`, 10, 60_000);

    const body = await parseJsonBody<{ email?: unknown; password?: unknown; name?: unknown }>(request);
    const email = assertString(body.email, 'email', { min: 3, max: 200 }).toLowerCase();
    const password = assertString(body.password, 'password', { min: 8, max: 200 });
    const name = asOptionalString(body.name, 'name', { max: 120 });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw badRequest('email must be a valid email address');
    }

    enforceRateLimit(`register:email:${email}`, 5, 3_600_000);

    const existing = await usersRepository.findByEmail(email);
    if (existing) {
      throw badRequest('Unable to register with provided credentials');
    }

    return usersRepository.create({
      email,
      name,
      passwordHash: hashPassword(password),
    });
  }, { request, operation: 'auth.register' });
}
