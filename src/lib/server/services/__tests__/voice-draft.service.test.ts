import test from 'node:test';
import assert from 'node:assert/strict';
import { generateVoiceDraft } from '@/lib/server/services/voice-draft.service';
import { AiPort } from '@/lib/server/ports/ai';
import { VoiceDraftPersistencePort } from '@/lib/server/ports/voice-draft';

test('generateVoiceDraft returns draft and drift info', async () => {
  const persistence: VoiceDraftPersistencePort = {
    async getDraftContext() {
      return {
        transcripts: ['hello there'],
        documentContent: 'doc',
        documentExists: true,
      };
    },
  };

  const ai: AiPort = {
    async analyzeTranscript() {
      return { tangents: [], patterns: [], gaps: [], contradictions: [], questions: [], annotations: [] };
    },
    async generateQuestionsFromProjectContext() {
      return [];
    },
    async generateVoicePreservedDraft() {
      return 'draft';
    },
    async detectVoiceDrift() {
      return { hasDrift: false, details: 'ok' };
    },
    async transcribeAudio() {
      return '';
    },
  };

  const result = await generateVoiceDraft({ projectId: 'p1', prompt: 'write' }, { ai, persistence });
  assert.equal(result.draft, 'draft');
  assert.equal(result.drift.hasDrift, false);
});
