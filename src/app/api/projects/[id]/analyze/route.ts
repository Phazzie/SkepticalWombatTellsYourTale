import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { analyzeTranscript } from '@/lib/openai';

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

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { sessionId, transcript } = await request.json();

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      documents: true,
      concepts: true,
      contradictions: {
        where: { status: 'open' },
        orderBy: { createdAt: 'desc' },
        take: 20,
      },
      sessions: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  });

  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const conceptContext = project.concepts
    .map((c) => `${c.name}: ${c.definition} [${c.status}]`)
    .join('\n');
  const contradictionContext = project.contradictions
    .map((c) => `${c.description}\nExisting: ${c.existing}\nNew: ${c.new}`)
    .join('\n\n');
  const sessionHistory = project.sessions
    .filter((s) => s.id !== sessionId)
    .map((s) => `Session ${s.id.slice(0, 8)} (${s.createdAt.toISOString().split('T')[0]}): ${s.transcript.slice(0, 300)}`)
    .join('\n\n');

  try {
    const augmentedProjectContext = buildAugmentedProjectContext({
      projectName: project.name,
      projectDescription: project.description,
      conceptContext,
      contradictionContext,
    });

    const analysis = await analyzeTranscript(
      transcript,
      augmentedProjectContext,
      sessionHistory,
      project.documents.map((d) => ({ id: d.id, name: d.name, content: d.content })),
      sessionId
    );

    if (analysis.tangents && analysis.tangents.length > 0) {
      await prisma.tangent.createMany({
        data: analysis.tangents.map((t) => ({
          projectId: id,
          sessionId,
          thread: t.thread,
          context: t.context || '',
          status: 'pending',
        })),
      });
    }

    if (analysis.patterns && analysis.patterns.length > 0) {
      await prisma.pattern.createMany({
        data: analysis.patterns.map((p) => ({
          projectId: id,
          description: p.description,
          sessionRefs: JSON.stringify(p.sessionRefs),
          acknowledged: false,
        })),
      });
    }

    if (analysis.gaps && analysis.gaps.length > 0) {
      await prisma.gap.createMany({
        data: analysis.gaps.map((g) => ({
          projectId: id,
          description: g.description,
          documentRef: g.documentRef || null,
          resolved: false,
        })),
      });
    }

    if (analysis.contradictions && analysis.contradictions.length > 0) {
      await prisma.contradiction.createMany({
        data: analysis.contradictions.map((c) => ({
          projectId: id,
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
        ? project.documents.find((d) => d.id === suggestedDocumentId)
        : null;
      const suggestedDocumentName = analysis.documentSuggestion?.documentName || suggestedDocumentById?.name || null;

      await prisma.concept.createMany({
        data: analysis.concepts.map((c) => {
          const linkedDocumentRef = c.linkedDocument || suggestedDocumentName || null;

          return {
            projectId: id,
            name: c.name,
            definition: c.definition,
            sourceSession: c.sourceSession || sessionId,
            linkedDocument: linkedDocumentRef,
            status: normalizeConceptStatus(c.status),
            approved: false,
          };
        }),
      });
    }

    if (analysis.questions && analysis.questions.length > 0) {
      await prisma.question.createMany({
        data: analysis.questions.map((q) => ({
          projectId: id,
          text: q,
          sessionRef: sessionId,
          status: 'pending',
        })),
      });
    }

    if (analysis.annotations && sessionId) {
      await prisma.session.updateMany({
        where: { id: sessionId, projectId: id },
        data: { aiAnnotations: JSON.stringify(analysis.annotations) },
      });
    }

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}
