import { AiPort } from '@/lib/server/ports/ai';
import { analyzeTranscript } from '@/lib/ai/analysis/transcript-analyzer';
import { generateQuestionsFromProjectContext } from '@/lib/ai/questions/generator';
import { detectVoiceDrift, generateVoicePreservedDraft } from '@/lib/ai/writing/voice-draft';
import { transcribeAudio } from '@/lib/ai/transcription';

export const openAiPort: AiPort = {
  analyzeTranscript,
  generateQuestionsFromProjectContext,
  generateVoicePreservedDraft,
  detectVoiceDrift,
  transcribeAudio,
};
