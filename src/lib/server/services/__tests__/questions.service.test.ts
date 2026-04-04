import test from 'node:test';
import assert from 'node:assert/strict';
import { generateQuestions, updateQuestionStatus } from '@/lib/server/services/questions.service';
import { AiPort } from '@/lib/server/ports/ai';
import { QuestionsPersistencePort } from '@/lib/server/ports/questions';

test('generateQuestions persists AI-generated questions', async () => {
  const created: Array<{ text: string }> = [];

  const persistence: QuestionsPersistencePort = {
    async list() {
      return [];
    },
    async updateStatus() {
      return null;
    },
    async getGenerationContext() {
      return {
        recentTranscriptContext: 'recent',
        documentContext: 'docs',
      };
    },
    async createGenerated(_projectId, questions) {
      created.push(...questions.map((q) => ({ text: q.text })));
      return questions.map((q, index) => ({
        id: `q${index}`,
        projectId: 'p1',
        text: q.text,
        sessionRef: q.sessionRef || null,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      }));
    },
  };

  const ai: AiPort = {
    async analyzeTranscript() {
      return { tangents: [], patterns: [], gaps: [], contradictions: [], questions: [], annotations: [] };
    },
    async generateQuestionsFromProjectContext() {
      return [{ text: 'what happened next?' }];
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

  const result = await generateQuestions('p1', { ai, persistence });
  assert.equal(result.length, 1);
  assert.equal(created.length, 1);
});

test('updateQuestionStatus throws when record missing', async () => {
  const persistence: QuestionsPersistencePort = {
    async list() {
      return [];
    },
    async updateStatus() {
      return null;
    },
    async getGenerationContext() {
      return null;
    },
    async createGenerated() {
      return [];
    },
  };

  await assert.rejects(() =>
    updateQuestionStatus({ projectId: 'p1', questionId: 'q1', status: 'pending' }, { persistence })
  );
});
