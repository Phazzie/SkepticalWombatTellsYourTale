import OpenAI from 'openai';
import { log } from '@/lib/server/logger';

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  log('error', 'OPENAI_API_KEY environment variable is not set — all AI features will fail');
}

export const openai = new OpenAI({ apiKey: apiKey ?? '' });
