import { handleRoute } from '@/lib/server/http';
import { requireUser } from '@/lib/server/auth';
import { requireProjectAccess } from '@/lib/server/services/project-access';
import { parseAiAnnotations } from '@/lib/server/mappers/ai-annotations';
import { sessionsRepository } from '@/lib/server/repositories/sessions';
import { parseJsonBody } from '@/lib/server/validation';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleRoute(async () => {
    const { userId } = await requireUser();
    const { id } = await params;

    await requireProjectAccess(id, userId);

    const sessions = await sessionsRepository.listByProject(id);
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
    const { userId } = await requireUser();
    const { id } = await params;

    await requireProjectAccess(id, userId);

    const data = await parseJsonBody<{ transcript?: unknown; aiAnnotations?: unknown }>(request);
    const transcript = typeof data.transcript === 'string' ? data.transcript : '';
    const aiAnnotations = Array.isArray(data.aiAnnotations) ? data.aiAnnotations : [];

    return sessionsRepository.create(id, transcript, aiAnnotations);
  }, { request, operation: 'projects.sessions.create' });
}
