import test from 'node:test';
import assert from 'node:assert/strict';
import { AiPort } from '@/lib/server/ports/ai';
import { transcribeAndCreateSession } from '@/lib/server/services/transcription.service';

function createAiPort(transcribeAudio: AiPort['transcribeAudio']): AiPort {
  return {
    async analyzeTranscript() {
      return { tangents: [], patterns: [], gaps: [], contradictions: [], questions: [], questionDetails: [], annotations: [] };
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
    transcribeAudio,
  };
}

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

  const ai = createAiPort(async () => 'transcript text');

  const result = await transcribeAndCreateSession({
    projectId: 'p1',
    audioFile: Buffer.from('audio'),
    filename: 'voice.webm',
    questionId: 'q1',
  }, { ai, createTranscribedSession });

  assert.equal(result.transcript, 'transcript text');
  assert.equal(result.sessionId, 's1');
  assert.equal(repositoryProjectId, 'p1');
  assert.equal(repositoryTranscript, 'transcript text');
  assert.equal(repositoryQuestionId, 'q1');
});

test('transcribeAndCreateSession propagates transcription failures and does not persist fallback text', async () => {
  let createTranscribedSessionCalled = false;

  const createTranscribedSession = async (): Promise<{ id: string }> => {
    createTranscribedSessionCalled = true;
    return { id: 's2' };
  };

  const ai = createAiPort(async () => {
    throw new Error('OpenAI unavailable');
  });

  await assert.rejects(
    () => transcribeAndCreateSession({
      projectId: 'p1',
      audioFile: Buffer.from('audio'),
      filename: 'voice.webm',
    }, { ai, createTranscribedSession }),
    /OpenAI unavailable/
  );

  assert.equal(createTranscribedSessionCalled, false);
});
