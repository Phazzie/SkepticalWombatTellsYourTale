import { openai } from '@/lib/ai/client';
import { AI_MODELS, AI_SLICE_LIMITS, AI_TEMPERATURES, AI_TOKEN_BUDGETS } from '@/lib/ai/config';
import { asObject, parseAiJsonObjectStrict, safeString } from '@/lib/ai/parsing';
import {
  VOICE_DRAFT_SYSTEM_PROMPT,
  VOICE_DRIFT_SYSTEM_PROMPT,
  buildVoiceDraftUserPrompt,
  buildVoiceDriftUserPrompt,
} from '@/lib/ai/prompts/voice-draft.prompts';
import { withRetry } from '@/lib/ai/retry';
import { sanitizeForPrompt, truncateToTokenBudget } from '@/lib/ai/utils';
import { log } from '@/lib/server/logger';

export async function generateVoicePreservedDraft(
  prompt: string,
  transcripts: string[],
  documentContext: string
): Promise<string> {
  const voiceSamples = transcripts.slice(0, AI_SLICE_LIMITS.maxVoiceSamplesDraft).join('\n\n---\n\n');
  const safePrompt = sanitizeForPrompt(prompt);
  const safeVoiceSamples = truncateToTokenBudget(sanitizeForPrompt(voiceSamples), AI_TOKEN_BUDGETS.voiceDraftInputMaxChars);
  const safeDocContext = truncateToTokenBudget(sanitizeForPrompt(documentContext), AI_TOKEN_BUDGETS.documentContextMaxChars);

  log('info', 'generateVoicePreservedDraft start', { model: AI_MODELS.chat });
  const startTime = Date.now();
  let response: Awaited<ReturnType<typeof openai.chat.completions.create>>;
  try {
    response = await withRetry(() => openai.chat.completions.create({
      model: AI_MODELS.chat,
      messages: [
        { role: 'system', content: VOICE_DRAFT_SYSTEM_PROMPT },
        { role: 'user', content: buildVoiceDraftUserPrompt({ voiceSamples: safeVoiceSamples, documentContext: safeDocContext, prompt: safePrompt }) },
      ],
      temperature: AI_TEMPERATURES.voiceDraft,
    }));
    log('info', 'generateVoicePreservedDraft success', {
      model: response.model,
      durationMs: Date.now() - startTime,
      promptTokens: response.usage?.prompt_tokens,
      completionTokens: response.usage?.completion_tokens,
    });
  } catch (err) {
    log('error', 'generateVoicePreservedDraft failed', { error: String(err), durationMs: Date.now() - startTime });
    return '';
  }

  return response.choices[0].message.content || '';
}

function normalizeDriftResponse(value: unknown): { value: { hasDrift: boolean; details: string; rewriteSuggestion?: string }; contractIssues: string[] } {
  const contractIssues: string[] = [];
  const parsed = asObject(value);
  const hasDrift = Boolean(parsed.hasDrift);
  const details = safeString(parsed.details);
  const rewriteSuggestion = safeString(parsed.rewriteSuggestion) || undefined;
  if (!details) {
    contractIssues.push('detectVoiceDrift: details must be a non-empty string');
  }
  return { value: { hasDrift, details, rewriteSuggestion }, contractIssues };
}

export async function detectVoiceDrift(
  draft: string,
  transcripts: string[]
): Promise<{ hasDrift: boolean; details: string; rewriteSuggestion?: string }> {
  const voiceSamples = transcripts.slice(0, AI_SLICE_LIMITS.maxVoiceSamplesDrift).join('\n\n---\n\n');
  const safeDraft = sanitizeForPrompt(draft);
  const safeVoiceSamples = truncateToTokenBudget(sanitizeForPrompt(voiceSamples), AI_TOKEN_BUDGETS.voiceDraftInputMaxChars);
  log('info', 'detectVoiceDrift start', { model: AI_MODELS.chat });
  const driftStartTime = Date.now();
  let driftResponse: Awaited<ReturnType<typeof openai.chat.completions.create>>;
  try {
    driftResponse = await withRetry(() => openai.chat.completions.create({
      model: AI_MODELS.chat,
      messages: [
        {
          role: 'system',
          content: VOICE_DRIFT_SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: buildVoiceDriftUserPrompt({ voiceSamples: safeVoiceSamples, draft: safeDraft }),
        },
      ],
      response_format: { type: 'json_object' },
      temperature: AI_TEMPERATURES.voiceDrift,
    }));
    log('info', 'detectVoiceDrift success', {
      model: driftResponse.model,
      durationMs: Date.now() - driftStartTime,
      promptTokens: driftResponse.usage?.prompt_tokens,
      completionTokens: driftResponse.usage?.completion_tokens,
    });
  } catch (err) {
    log('error', 'detectVoiceDrift failed', { error: String(err), durationMs: Date.now() - driftStartTime });
    return { hasDrift: false, details: '', rewriteSuggestion: undefined };
  }

  const parsed = parseAiJsonObjectStrict({
    content: driftResponse.choices[0].message.content,
    fallback: { hasDrift: false, details: '', rewriteSuggestion: undefined },
    label: 'detectVoiceDrift',
    normalize: normalizeDriftResponse,
  });
  return parsed.value;
}
