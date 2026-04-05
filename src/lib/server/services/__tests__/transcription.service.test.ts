import test from 'node:test';
import assert from 'node:assert/strict';
import { AiPort } from '@/lib/server/ports/ai';
import { transcribeAndCreateSession } from '@/lib/server/services/transcription.service';

test('transcribeAndCreateSession stores ai transcript and passes questionId', async () => {
  const originalCreateTranscribedSession = (await import('@/lib/server/repositories/ai-workflows')).aiWorkflowsRepository
    .createTranscribedSession;

  let repositoryProjectId = '';
  let repositoryTranscript = '';
  let repositoryQuestionId: string | null = null;

  (await import('@/lib/server/repositories/ai-workflows')).aiWorkflowsRepository.createTranscribedSession = async (
    projectId,
    transcript,
    questionId
  ) => {
    repositoryProjectId = projectId;
    repositoryTranscript = transcript;
    repositoryQuestionId = questionId;
    return { id: 's1' } as { id: string };
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
      return 'transcript text';
    },
  };

  try {
    const result = await transcribeAndCreateSession({
      projectId: 'p1',
      audioBuffer: Buffer.from('audio'),
      filename: 'voice.webm',
      questionId: 'q1',
    }, { ai });

    assert.equal(result.transcript, 'transcript text');
    assert.equal(result.sessionId, 's1');
    assert.equal(repositoryProjectId, 'p1');
    assert.equal(repositoryTranscript, 'transcript text');
    assert.equal(repositoryQuestionId, 'q1');
  } finally {
    (await import('@/lib/server/repositories/ai-workflows')).aiWorkflowsRepository.createTranscribedSession =
      originalCreateTranscribedSession;
  }
});

test('transcribeAndCreateSession falls back when ai transcription fails', async () => {
  const originalCreateTranscribedSession = (await import('@/lib/server/repositories/ai-workflows')).aiWorkflowsRepository
    .createTranscribedSession;

  let repositoryTranscript = '';
  let repositoryQuestionId: string | null = 'should-change';

  (await import('@/lib/server/repositories/ai-workflows')).aiWorkflowsRepository.createTranscribedSession = async (
    _projectId,
    transcript,
    questionId
  ) => {
    repositoryTranscript = transcript;
    repositoryQuestionId = questionId;
    return { id: 's2' } as { id: string };
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
      throw new Error('OpenAI unavailable');
    },
  };

  try {
    const result = await transcribeAndCreateSession({
      projectId: 'p1',
      audioBuffer: Buffer.from('audio'),
      filename: 'voice.webm',
    }, { ai });

    assert.equal(result.sessionId, 's2');
    assert.equal(result.transcript, '[Transcription unavailable — configure OpenAI API key]');
    assert.equal(repositoryTranscript, '[Transcription unavailable — configure OpenAI API key]');
    assert.equal(repositoryQuestionId, null);
  } finally {
    (await import('@/lib/server/repositories/ai-workflows')).aiWorkflowsRepository.createTranscribedSession =
      originalCreateTranscribedSession;
  }
});
