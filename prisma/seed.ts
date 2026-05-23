import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/lib/auth/password';

const prisma = new PrismaClient();

async function main() {
  const email = 'test@example.com';

  // Clean up existing
  await prisma.user.deleteMany({ where: { email } });

  const passwordHash = hashPassword('password123');

  const user = await prisma.user.create({
    data: {
      email,
      name: 'Test User',
      passwordHash,
      projects: {
        create: {
          name: 'My First Memoir',
          description: 'A test project seeded for local development',
          documents: {
            create: [
              { name: 'Childhood Stories', type: 'general', content: 'Once upon a time...' },
              { name: 'College Years', type: 'general', content: 'Then I went to school.' }
            ]
          }
        }
      }
    },
    include: {
      projects: true
    }
  });

  console.log(`Seeded User: ${user.email} with password "password123"`);
  console.log(`Seeded Project: ${user.projects[0].name}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
