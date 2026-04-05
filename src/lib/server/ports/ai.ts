import { AnalysisResult } from '@/lib/types';
import { QuestionGenerationResult } from '@/lib/ai/questions/generator';

export interface AiPort {
  analyzeTranscript(
    transcript: string,
    projectContext: string,
    sessionHistory: string,
    existingDocuments: Array<{ id: string; name: string; content: string }>,
    sessionId: string
  ): Promise<AnalysisResult>;
  generateQuestionsFromProjectContext(
    recentTranscriptContext: string,
    documentContext: string
  ): Promise<QuestionGenerationResult>;
  generateVoicePreservedDraft(prompt: string, transcripts: string[], documentContext: string): Promise<string>;
  detectVoiceDrift(
    draft: string,
    transcripts: string[]
  ): Promise<{ hasDrift: boolean; details: string; rewriteSuggestion?: string }>;
  transcribeAudio(audioBuffer: Buffer, filename: string): Promise<string>;
}
