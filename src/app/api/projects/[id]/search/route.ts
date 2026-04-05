import { handleRoute } from '@/lib/server/http';
import { requireUser } from '@/lib/server/auth';
import { requireProjectAccess } from '@/lib/server/services/project-access';
import { validateSchema } from '@/lib/server/schema';
import { searchQuerySchema } from '@/lib/server/schemas/api/search';
import { searchProject } from '@/lib/server/services/search.service';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleRoute(async () => {
    const { userId } = await requireUser();
    const { id } = await params;
    await requireProjectAccess(id, userId);

    const url = new URL(request.url);
    const query = validateSchema({ q: url.searchParams.get('q') || undefined }, searchQuerySchema, 'query');
    return searchProject(id, query.q);
  }, { request, operation: 'projects.search' });
}
