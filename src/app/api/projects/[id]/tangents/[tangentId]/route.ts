import { handleRoute } from '@/lib/server/http';
import { requireUser } from '@/lib/server/auth';
import { requireProjectAccess } from '@/lib/server/services/project-access';
import { badRequest, notFound } from '@/lib/server/errors';
import { analysisRepository } from '@/lib/server/repositories/analysis';
import { parseJsonBody } from '@/lib/server/validation';

const VALID_STATUSES = ['pending', 'resolved', 'dismissed'] as const;
type TangentStatus = (typeof VALID_STATUSES)[number];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; tangentId: string }> }
) {
  return handleRoute(async () => {
    const { userId } = await requireUser();
    const { id, tangentId } = await params;
    await requireProjectAccess(id, userId);

    const body = await parseJsonBody<{ status?: unknown }>(request);
    const status = body.status;

    if (!status || !VALID_STATUSES.includes(status as TangentStatus)) {
      throw badRequest(`Invalid payload. \`status\` must be one of: ${VALID_STATUSES.join(', ')}`);
    }

    const result = await analysisRepository.updateTangentStatus(id, tangentId, status as TangentStatus);
    if (result.count === 0) {
      throw notFound('Tangent not found');
    }

    return { success: true };
  }, { request, operation: 'projects.tangents.patch' });
}
