import { handleRoute } from '@/lib/server/http';
import { requireUser } from '@/lib/server/auth';
import { requireProjectAccess } from '@/lib/server/services/project-access';
import { assertString } from '@/lib/server/validation';
import { safeParseJson } from '@/lib/server/json';
import { sessionsRepository } from '@/lib/server/repositories/sessions';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleRoute(async () => {
    const { userId } = await requireUser();
    const { id } = await params;

    await requireProjectAccess(id, userId);

    const sessions = await sessionsRepository.listByProject(id);
    return sessions.map((s) => ({
      ...s,
      aiAnnotations: safeParseJson(s.aiAnnotations, []),
    }));
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

    const data = (await request.json()) as { transcript?: unknown; aiAnnotations?: unknown };
    const transcript = typeof data.transcript === 'string' ? data.transcript : '';
    const aiAnnotations = Array.isArray(data.aiAnnotations) ? data.aiAnnotations : [];

    return sessionsRepository.create(id, transcript, JSON.stringify(aiAnnotations));
  });
}
