import { prisma } from '@/lib/db';
import { AnalysisResult } from '@/lib/types';
import { stringifyAiAnnotations } from '@/lib/server/mappers/ai-annotations';
import { stringifySessionRefs } from '@/lib/server/mappers/session-refs';

const VALID_CONCEPT_STATUSES = ['developing', 'complete', 'contradicted'] as const;
type ConceptStatus = (typeof VALID_CONCEPT_STATUSES)[number];

function isConceptStatus(status: unknown): status is ConceptStatus {
  return typeof status === 'string' && VALID_CONCEPT_STATUSES.some((value) => value === status);
}

function normalizeConceptStatus(status: unknown): ConceptStatus {
  if (isConceptStatus(status)) {
    return status;
  }
  return 'developing';
}

export const aiWorkflowsRepository = {
  async persistAnalysisWrites(projectId: string, sessionId: string, analysis: AnalysisResult, documents: Array<{ id: string; name: string }>) {
    await prisma.$transaction(async (tx) => {
      if (analysis.tangents.length > 0) {
        await tx.tangent.createMany({
          data: analysis.tangents.map((t) => ({
            projectId,
            sessionId,
            thread: t.thread,
            context: t.context || '',
            status: 'pending',
          })),
        });
      }

      if (analysis.patterns.length > 0) {
        await tx.pattern.createMany({
          data: analysis.patterns.map((p) => ({
            projectId,
            description: p.description,
            sessionRefs: stringifySessionRefs(p.sessionRefs),
            acknowledged: false,
          })),
        });
      }

      if (analysis.gaps.length > 0) {
        await tx.gap.createMany({
          data: analysis.gaps.map((g) => ({
            projectId,
            description: g.description,
            documentRef: g.documentRef || null,
            resolved: false,
          })),
        });
      }

      if (analysis.contradictions.length > 0) {
        await tx.contradiction.createMany({
          data: analysis.contradictions.map((c) => ({
            projectId,
            description: c.description,
            existing: c.existing,
            new: c.new,
            status: 'open',
          })),
        });
      }

      if (analysis.concepts && analysis.concepts.length > 0) {
        const suggestedDocumentId = analysis.documentSuggestion?.documentId;
        const suggestedDocumentById = suggestedDocumentId
          ? documents.find((d) => d.id === suggestedDocumentId)
          : null;
        const suggestedDocumentName = analysis.documentSuggestion?.documentName || suggestedDocumentById?.name || null;

        await tx.concept.createMany({
          data: analysis.concepts.map((c) => ({
            projectId,
            name: c.name,
            definition: c.definition,
            sourceSession: c.sourceSession || sessionId,
            linkedDocument: c.linkedDocument || suggestedDocumentName || null,
            status: normalizeConceptStatus(c.status),
            approved: false,
          })),
        });
      }

      if (analysis.questions.length > 0) {
        await tx.question.createMany({
          data: analysis.questions.map((q) => ({
            projectId,
            text: q,
            sessionRef: sessionId,
            status: 'pending',
          })),
        });
      }

      await tx.voiceSession.updateMany({
        where: { id: sessionId, projectId },
        data: { aiAnnotations: stringifyAiAnnotations(analysis.annotations) },
      });
    });
  },

  async createTranscribedSession(projectId: string, transcript: string, questionId: string | null) {
    return prisma.$transaction(async (tx) => {
      let validatedQuestionId: string | null = null;
      if (questionId) {
        const question = await tx.question.findFirst({
          where: { id: questionId, projectId },
          select: { id: true },
        });
        validatedQuestionId = question?.id ?? null;
      }

      const session = await tx.voiceSession.create({
        data: {
          projectId,
          questionId: validatedQuestionId,
          transcript,
          aiAnnotations: '[]',
        },
      });

      if (validatedQuestionId) {
        await tx.question.updateMany({
          where: { id: validatedQuestionId, projectId },
          data: { status: 'answered' },
        });
      }

      return session;
    });
  },
};
