import { validateSchema } from '@/lib/server/schema';
import { questionsPostSchema } from '@/lib/server/schemas/api/questions';
import { parseJsonBody } from '@/lib/server/validation';

export async function parseQuestionsPostBody(request: Request) {
  const body = validateSchema(
    await parseJsonBody(request),
    questionsPostSchema
  );
  const action = body.action || 'generate';
  return { body, action };
}
