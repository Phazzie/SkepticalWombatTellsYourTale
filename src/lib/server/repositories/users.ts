import { prisma } from '@/lib/db';

export const usersRepository = {
  findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },

  create(data: { email: string; name?: string | null; passwordHash: string }) {
    return prisma.user.create({
      data,
      select: { id: true, email: true, name: true },
    });
  },
};
