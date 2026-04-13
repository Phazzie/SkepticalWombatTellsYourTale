import test from 'node:test';
import assert from 'node:assert/strict';
import { generateVoiceDraft } from '@/lib/server/services/voice-draft.service';
import { AiPort } from '@/lib/server/ports/ai';
import { VoiceDraftPersistencePort } from '@/lib/server/ports/voice-draft';

test(
  'generateVoiceDraft fails fast without OPENAI_API_KEY when using default ai port',
  { concurrency: false },
  async () => {
    const original = process.env.OPENAI_API_KEY;

    try {
      delete process.env.OPENAI_API_KEY;

      const persistence: VoiceDraftPersistencePort = {
        async getDraftContext() {
          return {
            transcripts: ['line one'],
            documentContent: 'doc',
            documentExists: true,
          };
        },
      };

      await assert.rejects(() => generateVoiceDraft({ projectId: 'p1', prompt: 'write' }, { persistence }), /OPENAI_API_KEY/);
    } finally {
      if (original === undefined) {
        delete process.env.OPENAI_API_KEY;
      } else {
        process.env.OPENAI_API_KEY = original;
      }
    }
  }
);

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
      return { tangents: [], patterns: [], gaps: [], contradictions: [], questions: [], questionDetails: [], annotations: [] };
    },
    async generateQuestionsFromProjectContext() {
      return { questions: [], contractValidation: { isValid: true, issues: [] } };
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

test('generateVoiceDraft throws notFound when requested document does not exist', async () => {
  const persistence: VoiceDraftPersistencePort = {
    async getDraftContext() {
      return {
        transcripts: ['hello there'],
        documentContent: '',
        documentExists: false,
      };
    },
  };

  const ai: AiPort = {
    async analyzeTranscript() {
      return { tangents: [], patterns: [], gaps: [], contradictions: [], questions: [], questionDetails: [], annotations: [] };
    },
    async generateQuestionsFromProjectContext() {
      return { questions: [], contractValidation: { isValid: true, issues: [] } };
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

  await assert.rejects(
    () => generateVoiceDraft({ projectId: 'p1', documentId: 'missing', prompt: 'write' }, { ai, persistence }),
    /Document not found/
  );
});

test('generateVoiceDraft passes prompt/transcripts/document to ai port', async () => {
  let promptSeen = '';
  let transcriptsSeen: string[] = [];
  let docSeen = '';
  let draftSeen = '';

  const persistence: VoiceDraftPersistencePort = {
    async getDraftContext() {
      return {
        transcripts: ['line one', 'line two'],
        documentContent: 'chapter',
        documentExists: true,
      };
    },
  };

  const ai: AiPort = {
    async analyzeTranscript() {
      return { tangents: [], patterns: [], gaps: [], contradictions: [], questions: [], questionDetails: [], annotations: [] };
    },
    async generateQuestionsFromProjectContext() {
      return { questions: [], contractValidation: { isValid: true, issues: [] } };
    },
    async generateVoicePreservedDraft(prompt, transcripts, documentContext) {
      promptSeen = prompt;
      transcriptsSeen = transcripts;
      docSeen = documentContext;
      return 'draft 2';
    },
    async detectVoiceDrift(draft) {
      draftSeen = draft;
      return { hasDrift: true, details: 'drift', rewriteSuggestion: 'rewrite' };
    },
    async transcribeAudio() {
      return '';
    },
  };

  const result = await generateVoiceDraft({ projectId: 'p1', documentId: 'd1', prompt: 'write it' }, { ai, persistence });
  assert.equal(promptSeen, 'write it');
  assert.deepEqual(transcriptsSeen, ['line one', 'line two']);
  assert.equal(docSeen, 'chapter');
  assert.equal(draftSeen, 'draft 2');
  assert.equal(result.drift.hasDrift, true);
  assert.equal(result.drift.rewriteSuggestion, 'rewrite');
});
