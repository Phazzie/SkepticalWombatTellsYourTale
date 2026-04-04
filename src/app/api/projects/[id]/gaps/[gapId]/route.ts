import { handleRoute } from '@/lib/server/http';
import { requireUser } from '@/lib/server/auth';
import { requireProjectAccess } from '@/lib/server/services/project-access';
import { assertBoolean } from '@/lib/server/validation';
import { notFound } from '@/lib/server/errors';
import { analysisRepository } from '@/lib/server/repositories/analysis';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; gapId: string }> }
) {
  return handleRoute(async () => {
    const { userId } = await requireUser();
    const { id, gapId } = await params;
    await requireProjectAccess(id, userId);

    const body = (await request.json()) as { resolved?: unknown };
    const resolved = assertBoolean(body.resolved, 'resolved');

    const result = await analysisRepository.updateGapResolved(id, gapId, resolved);
    if (result.count === 0) {
      throw notFound('Gap not found');
    }

    return { success: true };
  });
}
