import { booleanSchema, literalUnionSchema, objectSchema, optionalSchema, stringSchema } from '@/lib/server/schema';

export const conceptStatusSchema = literalUnionSchema(['developing', 'complete', 'contradicted'] as const);

export const conceptsPatchSchema = objectSchema({
  conceptId: stringSchema({ min: 1, max: 200 }),
  approved: optionalSchema(booleanSchema()),
  status: optionalSchema(conceptStatusSchema),
});
