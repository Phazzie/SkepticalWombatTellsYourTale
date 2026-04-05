import { badRequest, notFound } from '@/lib/server/errors';
import { AiPort } from '@/lib/server/ports/ai';
import { QuestionStatus, QuestionsPersistencePort } from '@/lib/server/ports/questions';
import { openAiPort } from '@/lib/server/adapters/ai/openai-ai-port';
import { prismaQuestionsPort } from '@/lib/server/adapters/persistence/prisma-questions-port';
import { log } from '@/lib/server/logger';

export async function listQuestions(
  projectId: string,
  status: QuestionStatus | undefined,
  deps: { persistence?: QuestionsPersistencePort } = {}
) {
  const persistence = deps.persistence || prismaQuestionsPort;
  return persistence.list(projectId, status);
}

export async function updateQuestionStatus(
  input: { projectId: string; questionId: string; status: QuestionStatus },
  deps: { persistence?: QuestionsPersistencePort } = {}
) {
  const persistence = deps.persistence || prismaQuestionsPort;
  const updated = await persistence.updateStatus(input.projectId, input.questionId, input.status);
  if (!updated) {
    throw notFound('Question not found');
  }
  return updated;
}

export async function generateQuestions(
  projectId: string,
  deps: { ai?: AiPort; persistence?: QuestionsPersistencePort } = {}
) {
  if (!deps.ai && !process.env.OPENAI_API_KEY) {
    log('warn', 'Question generation attempted without OPENAI_API_KEY');
    throw badRequest('Question generation unavailable: configure OPENAI_API_KEY');
  }

  const ai = deps.ai || openAiPort;
  const persistence = deps.persistence || prismaQuestionsPort;

  const context = await persistence.getGenerationContext(projectId);
  if (!context) {
    throw notFound('Project not found');
  }

  const generated = await ai.generateQuestionsFromProjectContext(
    context.recentTranscriptContext,
    context.documentContext
  );
  if (!generated.contractValidation.isValid) {
    return {
      questions: [],
      contractValidation: generated.contractValidation,
    };
  }

  const candidates = generated.questions;
  if (candidates.length === 0) {
    return {
      questions: [],
      contractValidation: generated.contractValidation,
    };
  }

  const questions = await persistence.createGenerated(projectId, candidates);
  return {
    questions,
    contractValidation: generated.contractValidation,
  };
}
