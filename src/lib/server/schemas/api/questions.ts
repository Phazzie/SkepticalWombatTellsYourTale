import { literalUnionSchema, objectSchema, optionalSchema, stringSchema } from '@/lib/server/schema';

export const questionStatusSchema = literalUnionSchema(['pending', 'answered', 'dismissed'] as const);

export const questionsPostSchema = objectSchema({
  action: optionalSchema(stringSchema({ min: 1, max: 30 })),
  questionId: optionalSchema(stringSchema({ min: 1, max: 200 })),
  status: optionalSchema(questionStatusSchema),
});
