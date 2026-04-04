import { handleRoute } from '@/lib/server/http';
import { requireUser } from '@/lib/server/auth';
import { requireProjectAccess } from '@/lib/server/services/project-access';
import { assertString } from '@/lib/server/validation';
import { documentsRepository } from '@/lib/server/repositories/documents';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleRoute(async () => {
    const { userId } = await requireUser();
    const { id } = await params;

    await requireProjectAccess(id, userId);
    return documentsRepository.listByProject(id);
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleRoute(async () => {
    const { userId } = await requireUser();
    const { id } = await params;

    await requireProjectAccess(id, userId);

    const body = (await request.json()) as { name?: unknown; type?: unknown };
    const name = assertString(body.name, 'name', { min: 1, max: 120 });
    const type = typeof body.type === 'string' && body.type.trim().length > 0 ? body.type.trim() : 'general';

    return documentsRepository.create(id, name, type);
  });
}
