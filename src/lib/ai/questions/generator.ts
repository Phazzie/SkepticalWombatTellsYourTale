import { openai } from '@/lib/ai/client';
import { asObject, parseAiJsonObject, safeString } from '@/lib/ai/parsing';

export type GeneratedQuestion = { text: string; sessionRef?: string };

function normalizeGeneratedQuestions(value: unknown): GeneratedQuestion[] {
  const parsed = asObject(value);
  const questions = Array.isArray(parsed.questions) ? parsed.questions : [];
  return questions
    .map((entry) => asObject(entry))
    .map((entry) => ({
      text: safeString(entry.text),
      sessionRef: safeString(entry.sessionRef) || undefined,
    }))
    .filter((entry) => entry.text.trim().length > 0);
}

export async function generateQuestionsFromProjectContext(
  recentTranscriptContext: string,
  documentContext: string
): Promise<GeneratedQuestion[]> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content:
          'You are a skilled interviewer who asks questions that pull out the real story. Generate specific, pointed questions based on what the person has said — not generic prompts. Questions like "what happened right before that?" or "you mentioned X but never said what happened next." Return JSON only.',
      },
      {
        role: 'user',
        content: `Generate 8 specific questions for this project.\n\nRECENT TRANSCRIPTS:\n${recentTranscriptContext}\n\nDOCUMENTS:\n${documentContext}\n\nReturn JSON: { "questions": [{ "text": "question text", "sessionRef": null }] }`,
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.8,
  });

  return parseAiJsonObject<GeneratedQuestion[]>({
    content: response.choices[0].message.content,
    fallback: [],
    label: 'generateQuestionsFromProjectContext',
    normalize: normalizeGeneratedQuestions,
  });
}
