import { literalUnionSchema, objectSchema, optionalSchema, stringSchema } from '@/lib/server/schema';

export const contradictionStatusSchema = literalUnionSchema(['open', 'explored', 'dismissed'] as const);

export const contradictionsPatchSchema = objectSchema({
  contradictionId: stringSchema({ min: 1, max: 200 }),
  status: contradictionStatusSchema,
});

export const contradictionsQuerySchema = objectSchema({
  status: optionalSchema(contradictionStatusSchema),
});
