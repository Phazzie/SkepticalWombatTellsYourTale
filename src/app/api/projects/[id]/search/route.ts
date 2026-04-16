import { handleRoute } from '@/lib/server/http';
import { requireProjectHandler } from '@/lib/server/route-guard';
import { validateSchema } from '@/lib/server/schema';
import { searchQuerySchema } from '@/lib/server/schemas/api/search';
import { searchProject } from '@/lib/server/services/search.service';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleRoute(async () => {
    const { projectId } = await requireProjectHandler(params);

    const url = new URL(request.url);
    const query = validateSchema({ q: url.searchParams.get('q') || undefined }, searchQuerySchema, 'query');
    return searchProject(projectId, query.q);
  }, { request, operation: 'projects.search' });
}
