import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeTranscript } from '@/lib/ai/analysis/transcript-analyzer';
import { generateQuestionsFromProjectContext } from '@/lib/ai/questions/generator';
import { openai } from '@/lib/ai/client';

type OpenAiResponse = {
  choices: Array<{ message: { content: string | null } }>;
};

test('analyzeTranscript reports contract issues when required fields are missing', async () => {
  const originalCreate = openai.chat.completions.create;
  openai.chat.completions.create = (async () =>
    ({
      choices: [
        {
          message: {
            content: JSON.stringify({
              tangents: [{ thread: 'thread without evidence', context: 'ctx' }],
              patterns: [],
              gaps: [],
              contradictions: [],
              questions: [],
              concepts: [],
              annotations: [],
            }),
          },
        },
      ],
    }) as OpenAiResponse) as typeof openai.chat.completions.create;

  try {
    const result = await analyzeTranscript('transcript', 'project', 'history', [], 's1');
    assert.equal(result.contractValidation?.isValid, false);
    assert.ok((result.contractValidation?.issues || []).some((issue) => issue.includes('tangents[0]')));
  } finally {
    openai.chat.completions.create = originalCreate;
  }
});

test('generateQuestionsFromProjectContext reports invalid contract for missing contextAnchor', async () => {
  const originalCreate = openai.chat.completions.create;
  openai.chat.completions.create = (async () =>
    ({
      choices: [
        {
          message: {
            content: JSON.stringify({
              questions: [{ text: 'What happened next?' }],
            }),
          },
        },
      ],
    }) as OpenAiResponse) as typeof openai.chat.completions.create;

  try {
    const result = await generateQuestionsFromProjectContext('recent', 'docs');
    assert.equal(result.contractValidation.isValid, false);
    assert.equal(result.questions.length, 0);
    assert.ok(result.contractValidation.issues.some((issue) => issue.includes('contextAnchor')));
  } finally {
    openai.chat.completions.create = originalCreate;
  }
});
