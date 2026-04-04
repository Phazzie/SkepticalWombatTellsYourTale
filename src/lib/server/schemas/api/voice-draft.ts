import { nullableSchema, objectSchema, optionalSchema, stringSchema } from '@/lib/server/schema';

export const voiceDraftRequestSchema = objectSchema({
  documentId: optionalSchema(nullableSchema(stringSchema({ min: 1, max: 200 }))),
  prompt: stringSchema({ min: 1, max: 5000 }),
});
