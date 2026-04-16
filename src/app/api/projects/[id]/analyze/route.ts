import { handleRoute } from '@/lib/server/http';
import { requireProjectHandler } from '@/lib/server/route-guard';
import { validateSchema } from '@/lib/server/schema';
import { analyzeRequestSchema } from '@/lib/server/schemas/api/analyze';
import { analyzeProjectSession } from '@/lib/server/services/analysis.service';
import { enforceRateLimit } from '@/lib/server/rate-limit';
import { parseJsonBody } from '@/lib/server/validation';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleRoute(async () => {
    const { userId, projectId } = await requireProjectHandler(params);

    enforceRateLimit(`analyze:${userId}:${projectId}`, 3, 60_000);

    const body = validateSchema(await parseJsonBody(request), analyzeRequestSchema);
    return analyzeProjectSession({ projectId, sessionId: body.sessionId, transcript: body.transcript });
  }, { request, operation: 'projects.analyze' });
}
