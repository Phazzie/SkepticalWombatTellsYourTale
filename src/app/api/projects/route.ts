import { handleRoute } from '@/lib/server/http';
import { requireUser } from '@/lib/server/auth';
import { asOptionalString, assertString } from '@/lib/server/validation';
import { projectsService } from '@/lib/server/services/projects';

export async function GET() {
  return handleRoute(async () => {
    const { userId } = await requireUser();
    return projectsService.listForUser(userId);
  });
}

export async function POST(request: Request) {
  return handleRoute(async () => {
    const { userId } = await requireUser();
    const body = (await request.json()) as { name?: unknown; description?: unknown };

    const name = assertString(body.name, 'name', { min: 1, max: 120 });
    const description = asOptionalString(body.description, 'description', { max: 1000 });

    return projectsService.createProject(userId, name, description);
  });
}
