import { handleRoute } from '@/lib/server/http';
import { requireUser } from '@/lib/server/auth';
import { requireProjectAccess } from '@/lib/server/services/project-access';
import { validateSchema } from '@/lib/server/schema';
import { voiceDraftRequestSchema } from '@/lib/server/schemas/api/voice-draft';
import { generateVoiceDraft } from '@/lib/server/services/voice-draft.service';
import { enforceRateLimit } from '@/lib/server/rate-limit';
import { parseJsonBody } from '@/lib/server/validation';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleRoute(async () => {
    const { userId } = await requireUser();
    const { id } = await params;
    await requireProjectAccess(id, userId);

    enforceRateLimit(`voice-draft:${userId}:${id}`, 3, 60 * 60_000);

    const body = validateSchema(await parseJsonBody(request), voiceDraftRequestSchema);
    return generateVoiceDraft({ projectId: id, documentId: body.documentId || undefined, prompt: body.prompt });
  }, { request, operation: 'projects.voiceDraft' });
}
