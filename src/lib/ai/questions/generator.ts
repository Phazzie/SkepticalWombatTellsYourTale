import { openai } from '@/lib/ai/client';
import { AI_MODELS, AI_TEMPERATURES, AI_TOKEN_BUDGETS } from '@/lib/ai/config';
import { asObject, parseAiJsonObjectStrict, safeString } from '@/lib/ai/parsing';
import { QUESTIONS_SYSTEM_PROMPT, buildQuestionsUserPrompt } from '@/lib/ai/prompts/questions.prompts';
import { withRetry } from '@/lib/ai/retry';
import { sanitizeForPrompt, truncateToTokenBudget } from '@/lib/ai/utils';
import { log } from '@/lib/server/logger';

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
    }
    if (contextAnchor.length === 0) {
      contractIssues.push(`questions[${index}].contextAnchor must be a non-empty string`);
    }
    if (text.length === 0 || contextAnchor.length === 0) {
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
  const safeTranscript = truncateToTokenBudget(sanitizeForPrompt(recentTranscriptContext), AI_TOKEN_BUDGETS.transcriptMaxChars);
  const safeDocContext = truncateToTokenBudget(sanitizeForPrompt(documentContext), AI_TOKEN_BUDGETS.documentContextMaxChars);
  log('info', 'generateQuestionsFromProjectContext start', { model: AI_MODELS.chat });
  const startTime = Date.now();
  let response: Awaited<ReturnType<typeof openai.chat.completions.create>>;
  try {
    response = await withRetry(() => openai.chat.completions.create({
      model: AI_MODELS.chat,
      messages: [
        {
          role: 'system',
          content:
            'You are a skilled interviewer who asks questions that pull out the real story. Generate specific, pointed questions based on what the person has said — not generic prompts. Questions like "what happened right before that?" or "you mentioned X but never said what happened next." Return JSON only.',
        },
        {
          role: 'user',
          content:
            `Generate 8 specific questions for this project.\n\nRECENT TRANSCRIPTS:\n${safeTranscript}\n\nDOCUMENTS:\n${safeDocContext}\n\n` +
            `Return JSON: { "questions": [{ "text": "question text", "sessionRef": null, "contextAnchor": "specific quote or reference to where this comes from" }] }`,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: AI_TEMPERATURES.questions,
    }));
    log('info', 'generateQuestionsFromProjectContext success', {
      model: response.model,
      durationMs: Date.now() - startTime,
      promptTokens: response.usage?.prompt_tokens,
      completionTokens: response.usage?.completion_tokens,
    });
  } catch (err) {
    log('error', 'generateQuestionsFromProjectContext failed', { error: String(err), durationMs: Date.now() - startTime });
    return { questions: [], contractValidation: { isValid: false, issues: [String(err)] } };
  }

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
