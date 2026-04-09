import { handleRoute } from '@/lib/server/http';
import { requireProjectHandler } from '@/lib/server/route-guard';
import { parseAiAnnotations } from '@/lib/server/mappers/ai-annotations';
import { sessionsRepository } from '@/lib/server/repositories/sessions';
import { parseJsonBody } from '@/lib/server/validation';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleRoute(async () => {
    const { projectId } = await requireProjectHandler(params);

    const sessions = await sessionsRepository.listByProject(projectId);
    return sessions.map((s) => ({
      ...s,
      aiAnnotations: parseAiAnnotations(s.aiAnnotations),
    }));
  }, { request, operation: 'projects.sessions.list' });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleRoute(async () => {
    const { projectId } = await requireProjectHandler(params);

    const data = await parseJsonBody<{ transcript?: unknown; aiAnnotations?: unknown }>(request);
    const transcript = typeof data.transcript === 'string' ? data.transcript : '';
    const aiAnnotations = Array.isArray(data.aiAnnotations) ? data.aiAnnotations : [];

    return sessionsRepository.create(projectId, transcript, aiAnnotations);
  }, { request, operation: 'projects.sessions.create' });
}
