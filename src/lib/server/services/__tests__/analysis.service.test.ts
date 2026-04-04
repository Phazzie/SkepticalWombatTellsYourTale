import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeProjectSession } from '@/lib/server/services/analysis.service';
import { AiPort } from '@/lib/server/ports/ai';
import { AnalysisPersistencePort } from '@/lib/server/ports/analysis';

test('analyzeProjectSession orchestrates AI and persistence', async () => {
  const writes: Array<{ projectId: string; sessionId: string }> = [];

  const persistence: AnalysisPersistencePort = {
    async getProjectAnalysisContext() {
      return {
        projectName: 'Test project',
        projectDescription: 'desc',
        documents: [{ id: 'd1', name: 'Doc', content: 'abc' }],
        conceptContext: 'none',
        contradictionContext: 'none',
        sessionHistory: 'history',
      };
    },
    async persistAnalysisResult(projectId, sessionId) {
      writes.push({ projectId, sessionId });
    },
  };

  const ai: AiPort = {
    async analyzeTranscript() {
      return {
        tangents: [],
        patterns: [],
        gaps: [],
        contradictions: [],
        questions: [],
        annotations: [],
      };
    },
    async generateQuestionsFromProjectContext() {
      return [];
    },
    async generateVoicePreservedDraft() {
      return '';
    },
    async detectVoiceDrift() {
      return { hasDrift: false, details: '' };
    },
    async transcribeAudio() {
      return '';
    },
  };

  const result = await analyzeProjectSession(
    { projectId: 'p1', sessionId: 's1', transcript: 'hello' },
    { ai, persistence }
  );

  assert.deepEqual(result.questions, []);
  assert.equal(writes.length, 1);
  assert.deepEqual(writes[0], { projectId: 'p1', sessionId: 's1' });
});
