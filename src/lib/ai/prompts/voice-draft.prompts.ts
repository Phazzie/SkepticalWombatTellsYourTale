export const VOICE_DRAFT_SYSTEM_PROMPT =
  "You are a ghostwriter who writes ENTIRELY in the speaker's voice. Study these voice transcripts carefully — the cadence, word choices, sentence fragments, how they circle back, what they emphasize, their specific vocabulary. Write the requested passage so that when the speaker reads it back, they think \"yeah, that sounds exactly like me.\" Do NOT clean it up. Do NOT make it sound literary or professional. Capture the actual way they talk.";

export function buildVoiceDraftUserPrompt(params: {
  voiceSamples: string;
  documentContext: string;
  prompt: string;
}): string {
  const { voiceSamples, documentContext, prompt } = params;
  return `VOICE SAMPLES FROM TRANSCRIPTS:\n${voiceSamples}\n\nRELEVANT DOCUMENT CONTENT:\n${documentContext}\n\nWRITING REQUEST:\n${prompt}\n\nWrite this in the speaker's actual voice as learned from the transcripts above.`;
}

export const VOICE_DRIFT_SYSTEM_PROMPT =
  'You compare generated writing to transcript voice patterns and detect drift. Return only valid JSON.';

export function buildVoiceDriftUserPrompt(params: {
  voiceSamples: string;
  draft: string;
}): string {
  const { voiceSamples, draft } = params;
  return `Analyze whether this generated draft has drifted from the speaker's natural voice.\n\nVOICE SAMPLES:\n${voiceSamples}\n\nGENERATED DRAFT:\n${draft}\n\nReturn JSON:\n{\n  "hasDrift": true/false,\n  "details": "specific explanation of what drifted or why it matches",\n  "rewriteSuggestion": "optional short suggestion closer to voice"\n}`;
}
