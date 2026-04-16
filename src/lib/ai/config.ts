export const AI_MODELS = {
  chat: 'gpt-4o',
  transcription: 'whisper-1',
} as const;

export const AI_TEMPERATURES = {
  analysis: 0.7,
  questions: 0.8,
  voiceDraft: 0.8,
  voiceDrift: 0.3,
} as const;

export const AI_SLICE_LIMITS = {
  maxVoiceSamplesDraft: 5,
  maxVoiceSamplesDrift: 8,
} as const;

export const AI_TOKEN_BUDGETS = {
  transcriptMaxChars: 40_000,
  sessionHistoryMaxChars: 20_000,
  documentContextMaxChars: 30_000,
  voiceDraftInputMaxChars: 20_000,
} as const;
