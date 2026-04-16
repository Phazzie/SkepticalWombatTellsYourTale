import { handleRoute } from '@/lib/server/http';
import { notFound } from '@/lib/server/errors';
import { contradictionsRepository } from '@/lib/server/repositories/contradictions';
import { requireProjectHandler } from '@/lib/server/route-guard';
import {
  contradictionsPatchSchema,
  contradictionsQuerySchema,
} from '@/lib/server/schemas/api/contradictions';
import { validateSchema } from '@/lib/server/schema';
import { parseJsonBody } from '@/lib/server/validation';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleRoute(async () => {
    const { projectId } = await requireProjectHandler(params);

    const url = new URL(request.url);
    const query = validateSchema(
      { status: url.searchParams.get('status') || undefined },
      contradictionsQuerySchema,
      'query'
    );

    return contradictionsRepository.listByProject(projectId, query.status);
  }, { request, operation: 'projects.contradictions.list' });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleRoute(async () => {
    const { projectId } = await requireProjectHandler(params);
    const body = validateSchema(await parseJsonBody(request), contradictionsPatchSchema);

    const existing = await contradictionsRepository.findInProject(body.contradictionId, projectId);
    if (!existing) {
      throw notFound('Contradiction not found');
    }

    return contradictionsRepository.updateStatus(body.contradictionId, projectId, body.status);
  }, { request, operation: 'projects.contradictions.patch' });
}
