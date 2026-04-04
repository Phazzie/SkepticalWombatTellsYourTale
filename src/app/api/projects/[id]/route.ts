import { handleRoute } from '@/lib/server/http';
import { requireUser, ensureProjectAccess } from '@/lib/server/auth';
import { forbidden } from '@/lib/server/errors';
import { asOptionalString, assertString } from '@/lib/server/validation';
import { projectsRepository } from '@/lib/server/repositories/projects';
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
    await ensureProjectAccess(id, userId);

    const body = (await request.json()) as { name?: unknown; description?: unknown };
    const data: { name?: string; description?: string | null } = {};

    if (body.name !== undefined) {
      data.name = assertString(body.name, 'name', { min: 1, max: 120 });
    }

    if (body.description !== undefined) {
      data.description = asOptionalString(body.description, 'description', { max: 1000 });
    }

    return projectsRepository.updateProject(id, data);
  });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleRoute(async () => {
    const { userId } = await requireUser();
    const { id } = await params;
    const project = await ensureProjectAccess(id, userId);

    if (project.userId !== userId) {
      throw forbidden('Only project owner can delete project');
    }

    await projectsRepository.deleteProject(id);
    return { success: true };
  });
}
