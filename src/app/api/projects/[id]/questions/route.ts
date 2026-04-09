import { handleRoute } from '@/lib/server/http';
import { requireUser } from '@/lib/server/auth';
import { requireProjectAccess } from '@/lib/server/services/project-access';
import { badRequest } from '@/lib/server/errors';
import { questionStatusSchema } from '@/lib/server/schemas/api/questions';
import { generateQuestions, listQuestions, updateQuestionStatus } from '@/lib/server/services/questions.service';
import { enforceRateLimit } from '@/lib/server/rate-limit';
import { parseQuestionsPostBody } from '@/lib/server/routes/questions';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleRoute(async () => {
    const { userId } = await requireUser();
    const { id } = await params;
    await requireProjectAccess(id, userId);

    const url = new URL(request.url);
    const rawStatus = url.searchParams.get('status') || undefined;
    const status = rawStatus ? questionStatusSchema.parse(rawStatus, 'query.status') : undefined;

    return listQuestions(id, status);
  }, { request, operation: 'projects.questions.list' });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleRoute(async () => {
    const { userId } = await requireUser();
    const { id } = await params;
    await requireProjectAccess(id, userId);
    const { body, action } = await parseQuestionsPostBody(request);

    if (action === 'update') {
      if (!body.questionId || !body.status) {
        throw badRequest('Invalid question update payload');
      }
      return updateQuestionStatus({ projectId: id, questionId: body.questionId, status: body.status });
    }

    enforceRateLimit(`questions:${userId}:${id}`, 5, 60 * 60_000);
    return generateQuestions(id);
  }, { request, operation: 'projects.questions.mutate' });
}
