import { handleRoute } from '@/lib/server/http';
import { requireUser, ensureProjectAccess } from '@/lib/server/auth';
import { badRequest } from '@/lib/server/errors';
import { asOptionalString, assertString } from '@/lib/server/validation';
import { projectsService } from '@/lib/server/services/projects';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleRoute(async () => {
    const { userId } = await requireUser();
    const { id } = await params;
    await ensureProjectAccess(id, userId);

    const url = new URL(request.url);
    const includeAll = url.searchParams.get('include') === 'all';

    return projectsService.getProject(userId, id, includeAll);
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleRoute(async () => {
    const { userId } = await requireUser();
    const { id } = await params;

    const body = (await request
      .json()
      .catch(() => {
        throw badRequest('Request body must be valid JSON');
      })) as { name?: unknown; description?: unknown };
    const data: { name?: string; description?: string | null } = {};

    if (body.name !== undefined) {
      data.name = assertString(body.name, 'name', { min: 1, max: 120 });
    }

    if (body.description !== undefined) {
      data.description = asOptionalString(body.description, 'description', { max: 1000 });
    }

    return projectsService.updateProject(userId, id, data);
  });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleRoute(async () => {
    const { userId } = await requireUser();
    const { id } = await params;
    return projectsService.deleteProject(userId, id);
  });
}
