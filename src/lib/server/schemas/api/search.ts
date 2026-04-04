import { objectSchema, optionalSchema, stringSchema } from '@/lib/server/schema';

export const searchQuerySchema = objectSchema({
  q: optionalSchema(stringSchema({ min: 1, max: 300 })),
});
