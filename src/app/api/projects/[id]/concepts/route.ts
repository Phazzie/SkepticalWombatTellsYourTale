import { handleRoute } from '@/lib/server/http';
import { requireUser } from '@/lib/server/auth';
import { requireProjectAccess } from '@/lib/server/services/project-access';
import { notFound } from '@/lib/server/errors';
import { prisma } from '@/lib/db';
import { conceptsPatchSchema } from '@/lib/server/schemas/api/concepts';
import { validateSchema } from '@/lib/server/schema';
import { parseJsonBody } from '@/lib/server/validation';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleRoute(async () => {
    const { userId } = await requireUser();
    const { id } = await params;
    await requireProjectAccess(id, userId);

    return prisma.concept.findMany({
      where: { projectId: id },
      orderBy: { createdAt: 'desc' },
    });
  }, { request, operation: 'projects.concepts.list' });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleRoute(async () => {
    const { userId } = await requireUser();
    const { id } = await params;
    await requireProjectAccess(id, userId);

    const body = validateSchema(await parseJsonBody(request), conceptsPatchSchema);

    const existing = await prisma.concept.findFirst({ where: { id: body.conceptId, projectId: id } });
    if (!existing) {
      throw notFound('Concept not found');
    }

    return prisma.concept.update({
      where: { id: body.conceptId },
      data: {
        ...(typeof body.approved === 'boolean' ? { approved: body.approved } : {}),
        ...(typeof body.status === 'string' ? { status: body.status } : {}),
      },
    });
  }, { request, operation: 'projects.concepts.patch' });
}
