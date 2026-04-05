import test from 'node:test';
import assert from 'node:assert/strict';
import { generateQuestions, listQuestions, updateQuestionStatus } from '@/lib/server/services/questions.service';
import { AiPort } from '@/lib/server/ports/ai';
import { QuestionsPersistencePort } from '@/lib/server/ports/questions';

test('generateQuestions fails fast without OPENAI_API_KEY when using default ai port', async () => {
  const original = process.env.OPENAI_API_KEY;
  delete process.env.OPENAI_API_KEY;

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
    async createGenerated() {
      return [];
    },
  };

  await assert.rejects(() => generateQuestions('p1', { persistence }), /OPENAI_API_KEY/);

  if (original === undefined) {
    delete process.env.OPENAI_API_KEY;
  } else {
    process.env.OPENAI_API_KEY = original;
  }
});

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

test('listQuestions delegates to persistence with optional status', async () => {
  const persistence: QuestionsPersistencePort = {
    async list(projectId, status) {
      assert.equal(projectId, 'p1');
      assert.equal(status, 'answered');
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

  const result = await listQuestions('p1', 'answered', { persistence });
  assert.deepEqual(result, []);
});

test('generateQuestions throws notFound when project context is missing', async () => {
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

  const ai: AiPort = {
    async analyzeTranscript() {
      return { tangents: [], patterns: [], gaps: [], contradictions: [], questions: [], annotations: [] };
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

  await assert.rejects(() => generateQuestions('missing', { ai, persistence }), /Project not found/);
});

test('generateQuestions returns empty list when ai returns no candidates', async () => {
  let createdCalled = false;
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
    async createGenerated() {
      createdCalled = true;
      return [];
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
  assert.deepEqual(result, []);
  assert.equal(createdCalled, false);
});

test('updateQuestionStatus returns updated question when persistence finds record', async () => {
  const now = new Date();
  const persistence: QuestionsPersistencePort = {
    async list() {
      return [];
    },
    async updateStatus(projectId, questionId, status) {
      assert.equal(projectId, 'p1');
      assert.equal(questionId, 'q1');
      assert.equal(status, 'answered');
      return {
        id: 'q1',
        projectId,
        text: 'question?',
        sessionRef: null,
        status,
        createdAt: now,
        updatedAt: now,
      };
    },
    async getGenerationContext() {
      return null;
    },
    async createGenerated() {
      return [];
    },
  };

  const result = await updateQuestionStatus({ projectId: 'p1', questionId: 'q1', status: 'answered' }, { persistence });
  assert.equal(result.id, 'q1');
  assert.equal(result.status, 'answered');
});
