import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeProjectSession } from '@/lib/server/services/analysis.service';
import { AiPort } from '@/lib/server/ports/ai';
import { AnalysisPersistencePort } from '@/lib/server/ports/analysis';

test(
  'analyzeProjectSession fails fast without OPENAI_API_KEY when using default ai port',
  { concurrency: false },
  async () => {
  const original = process.env.OPENAI_API_KEY;
  try {
    delete process.env.OPENAI_API_KEY;

    const persistence: AnalysisPersistencePort = {
      async getProjectAnalysisContext() {
        return {
          projectName: 'Memoir',
          projectDescription: 'A life story',
          documents: [{ id: 'doc-1', name: 'Ch1', content: 'content' }],
          conceptContext: '',
          contradictionContext: '',
          sessionHistory: '',
        };
      },
      async persistAnalysisResult() {},
    };

    await assert.rejects(
      () => analyzeProjectSession({ projectId: 'p1', sessionId: 's1', transcript: 'hello' }, { persistence }),
      /OPENAI_API_KEY/
    );
  } finally {
    if (original === undefined) {
      delete process.env.OPENAI_API_KEY;
    } else {
      process.env.OPENAI_API_KEY = original;
    }
  }
});

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

test('analyzeProjectSession throws notFound when project context is missing', async () => {
  const persistence: AnalysisPersistencePort = {
    async getProjectAnalysisContext() {
      return null;
    },
    async persistAnalysisResult() {},
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

  await assert.rejects(
    () => analyzeProjectSession({ projectId: 'missing', sessionId: 's1', transcript: 'hello' }, { ai, persistence }),
    /Project not found/
  );
});

test('analyzeProjectSession passes composed context and documents to ai port', async () => {
  let receivedContext = '';
  let receivedHistory = '';
  let receivedDocs: Array<{ id: string; name: string; content: string }> = [];
  let receivedSessionId = '';

  const persistence: AnalysisPersistencePort = {
    async getProjectAnalysisContext() {
      return {
        projectName: 'Memoir',
        projectDescription: 'A life story',
        documents: [{ id: 'doc-1', name: 'Ch1', content: 'content' }],
        conceptContext: 'Concept A',
        contradictionContext: 'None',
        sessionHistory: 'Earlier session',
      };
    },
    async persistAnalysisResult() {},
  };

  const ai: AiPort = {
    async analyzeTranscript(_transcript, projectContext, sessionHistory, existingDocuments, sessionId) {
      receivedContext = projectContext;
      receivedHistory = sessionHistory;
      receivedDocs = existingDocuments;
      receivedSessionId = sessionId;
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

  await analyzeProjectSession({ projectId: 'p1', sessionId: 's1', transcript: 'hello' }, { ai, persistence });

  assert.match(receivedContext, /Project: "Memoir"/);
  assert.match(receivedContext, /CONCEPT LIBRARY:/);
  assert.match(receivedContext, /OPEN CONTRADICTIONS:/);
  assert.equal(receivedHistory, 'Earlier session');
  assert.equal(receivedDocs.length, 1);
  assert.equal(receivedDocs[0].id, 'doc-1');
  assert.equal(receivedSessionId, 's1');
});
