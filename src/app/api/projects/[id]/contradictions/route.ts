import { handleRoute } from '@/lib/server/http';
import { requireUser } from '@/lib/server/auth';
import { requireProjectAccess } from '@/lib/server/services/project-access';
import { notFound } from '@/lib/server/errors';
import { prisma } from '@/lib/db';
import {
  contradictionsPatchSchema,
  contradictionsQuerySchema,
} from '@/lib/server/schemas/api/contradictions';
import { validateSchema } from '@/lib/server/schema';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleRoute(async () => {
    const { userId } = await requireUser();
    const { id } = await params;
    await requireProjectAccess(id, userId);

    const url = new URL(request.url);
    const query = validateSchema(
      { status: url.searchParams.get('status') || undefined },
      contradictionsQuerySchema,
      'query'
    );

    return prisma.contradiction.findMany({
      where: {
        projectId: id,
        ...(query.status ? { status: query.status } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
  }, { request, operation: 'projects.contradictions.list' });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleRoute(async () => {
    const { userId } = await requireUser();
    const { id } = await params;
    await requireProjectAccess(id, userId);

    const body = validateSchema(await request.json(), contradictionsPatchSchema);

    const existing = await prisma.contradiction.findFirst({
      where: { id: body.contradictionId, projectId: id },
    });

    if (!existing) {
      throw notFound('Contradiction not found');
    }

    return prisma.contradiction.update({
      where: { id: body.contradictionId },
      data: { status: body.status },
    });
  }, { request, operation: 'projects.contradictions.patch' });
}
