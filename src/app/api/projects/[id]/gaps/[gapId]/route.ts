import { handleRoute } from '@/lib/server/http';
import { requireProjectHandler } from '@/lib/server/route-guard';
import { assertBoolean, parseJsonBody } from '@/lib/server/validation';
import { notFound } from '@/lib/server/errors';
import { analysisRepository } from '@/lib/server/repositories/analysis';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; gapId: string }> }
) {
  return handleRoute(async () => {
    const { projectId, gapId } = await requireProjectHandler(params);

    const body = await parseJsonBody<{ resolved?: unknown }>(request);
    const resolved = assertBoolean(body.resolved, 'resolved');

    const result = await analysisRepository.updateGapResolved(projectId, gapId, resolved);
    if (result.count === 0) {
      throw notFound('Gap not found');
    }

    return { success: true };
  }, { request, operation: 'projects.gaps.patch' });
}
