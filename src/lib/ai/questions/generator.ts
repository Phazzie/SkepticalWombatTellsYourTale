import { openai } from '@/lib/ai/client';
import { asObject, parseAiJsonObjectStrict, safeString } from '@/lib/ai/parsing';

export type GeneratedQuestion = { text: string; sessionRef?: string; contextAnchor: string };
export type QuestionGenerationResult = {
  questions: GeneratedQuestion[];
  contractValidation: {
    isValid: boolean;
    issues: string[];
    parseError?: string;
  };
};

function normalizeGeneratedQuestions(value: unknown): { value: GeneratedQuestion[]; contractIssues: string[] } {
  const contractIssues: string[] = [];
  const parsed = asObject(value);
  const questionsRaw = parsed.questions;
  if (!Array.isArray(questionsRaw)) {
    contractIssues.push('questions must be an array');
    return { value: [], contractIssues };
  }

  const valueOut: GeneratedQuestion[] = [];
  questionsRaw.forEach((rawEntry, index) => {
    const entry = asObject(rawEntry);
    const text = safeString(entry.text).trim();
    const sessionRefRaw = safeString(entry.sessionRef).trim();
    const contextAnchor = safeString(entry.contextAnchor).trim();

    if (text.length === 0) {
      contractIssues.push(`questions[${index}].text must be a non-empty string`);
      return;
    }
    if (contextAnchor.length === 0) {
      contractIssues.push(`questions[${index}].contextAnchor must be a non-empty string`);
      return;
    }

    valueOut.push({
      text,
      sessionRef: sessionRefRaw || undefined,
      contextAnchor,
    });
  });

  return { value: valueOut, contractIssues };
}

export async function generateQuestionsFromProjectContext(
  recentTranscriptContext: string,
  documentContext: string
): Promise<QuestionGenerationResult> {
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
        content:
          `Generate 8 specific questions for this project.\n\nRECENT TRANSCRIPTS:\n${recentTranscriptContext}\n\nDOCUMENTS:\n${documentContext}\n\n` +
          `Return JSON: { "questions": [{ "text": "question text", "sessionRef": null, "contextAnchor": "specific quote or reference to where this comes from" }] }`,
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.8,
  });

  const parsed = parseAiJsonObjectStrict<GeneratedQuestion[]>({
    content: response.choices[0].message.content,
    fallback: [],
    label: 'generateQuestionsFromProjectContext',
    normalize: normalizeGeneratedQuestions,
  });
  return {
    questions: parsed.value,
    contractValidation: {
      isValid: parsed.contractIssues.length === 0,
      issues: parsed.contractIssues,
      parseError: parsed.parseError,
    },
  };
}
