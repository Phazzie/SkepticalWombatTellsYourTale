import { objectSchema, stringSchema } from '@/lib/server/schema';

export const analyzeRequestSchema = objectSchema({
  sessionId: stringSchema({ min: 1, max: 200 }),
  transcript: stringSchema({ min: 0, max: 300000, trim: false }),
});
