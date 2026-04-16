import { handleRoute } from '@/lib/server/http';
import { notFound } from '@/lib/server/errors';
import { conceptsRepository } from '@/lib/server/repositories/concepts';
import { requireProjectHandler } from '@/lib/server/route-guard';
import { conceptsPatchSchema } from '@/lib/server/schemas/api/concepts';
import { validateSchema } from '@/lib/server/schema';
import { parseJsonBody } from '@/lib/server/validation';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleRoute(async () => {
    const { projectId } = await requireProjectHandler(params);
    return conceptsRepository.listByProject(projectId);
  }, { request, operation: 'projects.concepts.list' });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleRoute(async () => {
    const { projectId } = await requireProjectHandler(params);
    const body = validateSchema(await parseJsonBody(request), conceptsPatchSchema);

    const existing = await conceptsRepository.findInProject(body.conceptId, projectId);
    if (!existing) {
      throw notFound('Concept not found');
    }

    return conceptsRepository.update(body.conceptId, projectId, {
      ...(typeof body.approved === 'boolean' ? { approved: body.approved } : {}),
      ...(typeof body.status === 'string' ? { status: body.status } : {}),
    });
  }, { request, operation: 'projects.concepts.patch' });
}
