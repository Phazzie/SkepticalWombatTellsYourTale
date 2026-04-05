import test from 'node:test';
import assert from 'node:assert/strict';
import { AiPort } from '@/lib/server/ports/ai';
import { transcribeAndCreateSession } from '@/lib/server/services/transcription.service';

test('transcribeAndCreateSession stores ai transcript and passes questionId', async () => {
  let repositoryProjectId = '';
  let repositoryTranscript = '';
  let repositoryQuestionId: string | null = null;

  const createTranscribedSession = async (
    projectId: string,
    transcript: string,
    questionId: string | null
  ): Promise<{ id: string }> => {
    repositoryProjectId = projectId;
    repositoryTranscript = transcript;
    repositoryQuestionId = questionId;
    return { id: 's1' };
  };

  const ai: AiPort = {
    async analyzeTranscript() {
      return { tangents: [], patterns: [], gaps: [], contradictions: [], questions: [], annotations: [] };
    },
    async generateQuestionsFromProjectContext() {
      return { questions: [], contractValidation: { isValid: true, issues: [] } };
    },
    async generateVoicePreservedDraft() {
      return '';
    },
    async detectVoiceDrift() {
      return { hasDrift: false, details: '' };
    },
    async transcribeAudio() {
      return 'transcript text';
    },
  };

  const result = await transcribeAndCreateSession({
      projectId: 'p1',
      audioBuffer: Buffer.from('audio'),
      filename: 'voice.webm',
      questionId: 'q1',
    }, { ai, createTranscribedSession });

  assert.equal(result.transcript, 'transcript text');
  assert.equal(result.sessionId, 's1');
  assert.equal(repositoryProjectId, 'p1');
  assert.equal(repositoryTranscript, 'transcript text');
  assert.equal(repositoryQuestionId, 'q1');
});

test('transcribeAndCreateSession falls back when ai transcription fails', async () => {
  let repositoryTranscript = '';
  let repositoryQuestionId: string | null = 'should-change';

  const createTranscribedSession = async (
    _projectId: string,
    transcript: string,
    questionId: string | null
  ): Promise<{ id: string }> => {
    repositoryTranscript = transcript;
    repositoryQuestionId = questionId;
    return { id: 's2' };
  };

  const ai: AiPort = {
    async analyzeTranscript() {
      return { tangents: [], patterns: [], gaps: [], contradictions: [], questions: [], annotations: [] };
    },
    async generateQuestionsFromProjectContext() {
      return { questions: [], contractValidation: { isValid: true, issues: [] } };
    },
    async generateVoicePreservedDraft() {
      return '';
    },
    async detectVoiceDrift() {
      return { hasDrift: false, details: '' };
    },
    async transcribeAudio() {
      throw new Error('OpenAI unavailable');
    },
  };

  const result = await transcribeAndCreateSession({
      projectId: 'p1',
      audioBuffer: Buffer.from('audio'),
      filename: 'voice.webm',
    }, { ai, createTranscribedSession });

  assert.equal(result.sessionId, 's2');
  assert.equal(result.transcript, '[Transcription unavailable — configure OpenAI API key]');
  assert.equal(repositoryTranscript, '[Transcription unavailable — configure OpenAI API key]');
  assert.equal(repositoryQuestionId, null);
});
