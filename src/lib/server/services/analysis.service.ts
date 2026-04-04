import { notFound } from '@/lib/server/errors';
import { AnalysisResult } from '@/lib/types';
import { AiPort } from '@/lib/server/ports/ai';
import { AnalysisPersistencePort } from '@/lib/server/ports/analysis';
import { openAiPort } from '@/lib/server/adapters/ai/openai-ai-port';
import { prismaAnalysisPort } from '@/lib/server/adapters/persistence/prisma-analysis-port';

function buildAugmentedProjectContext(input: {
  projectName: string;
  projectDescription?: string | null;
  conceptContext: string;
  contradictionContext: string;
}) {
  const { projectName, projectDescription, conceptContext, contradictionContext } = input;
  return [
    `Project: "${projectName}"`,
    projectDescription || '',
    '',
    'CONCEPT LIBRARY:',
    conceptContext || 'None yet',
    '',
    'OPEN CONTRADICTIONS:',
    contradictionContext || 'None yet',
  ].join('\n');
}

export async function analyzeProjectSession(
  input: { projectId: string; sessionId: string; transcript: string },
  deps: { ai?: AiPort; persistence?: AnalysisPersistencePort } = {}
): Promise<AnalysisResult> {
  const ai = deps.ai || openAiPort;
  const persistence = deps.persistence || prismaAnalysisPort;

  const context = await persistence.getProjectAnalysisContext(input.projectId, input.sessionId);
  if (!context) {
    throw notFound('Project not found');
  }

  const analysis = await ai.analyzeTranscript(
    input.transcript,
    buildAugmentedProjectContext({
      projectName: context.projectName,
      projectDescription: context.projectDescription,
      conceptContext: context.conceptContext,
      contradictionContext: context.contradictionContext,
    }),
    context.sessionHistory,
    context.documents,
    input.sessionId
  );

  await persistence.persistAnalysisResult(input.projectId, input.sessionId, analysis);
  return analysis;
}
