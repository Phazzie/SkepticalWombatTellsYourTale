import { handleRoute } from '@/lib/server/http';
import { requireProjectHandler } from '@/lib/server/route-guard';
import { assertString, parseJsonBody } from '@/lib/server/validation';
import { documentsRepository } from '@/lib/server/repositories/documents';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleRoute(async () => {
    const { projectId } = await requireProjectHandler(params);
    return documentsRepository.listByProject(projectId);
  }, { request, operation: 'projects.documents.list' });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleRoute(async () => {
    const { projectId } = await requireProjectHandler(params);

    const body = await parseJsonBody<{ name?: unknown; type?: unknown }>(request);
    const name = assertString(body.name, 'name', { min: 1, max: 120 });
    const type = typeof body.type === 'string' && body.type.trim().length > 0 ? body.type.trim() : 'general';

    return documentsRepository.create(projectId, name, type);
  }, { request, operation: 'projects.documents.create' });
}
