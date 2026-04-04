import { prisma } from '@/lib/db';
import { analyzeTranscript } from '@/lib/openai';
import { handleRoute } from '@/lib/server/http';
import { requireUser } from '@/lib/server/auth';
import { requireProjectAccess } from '@/lib/server/services/project-access';
import { notFound } from '@/lib/server/errors';
import { assertString } from '@/lib/server/validation';
import { analysisRepository } from '@/lib/server/repositories/analysis';
import { sessionsRepository } from '@/lib/server/repositories/sessions';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleRoute(async () => {
    const { userId } = await requireUser();
    const { id } = await params;
    await requireProjectAccess(id, userId);

    const body = (await request.json()) as { sessionId?: unknown; transcript?: unknown };
    const sessionId = assertString(body.sessionId, 'sessionId', { min: 1, max: 100 });
    const transcript = assertString(body.transcript, 'transcript', { min: 1, max: 200000 });

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        documents: true,
        sessions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!project) {
      throw notFound('Project not found');
    }

    const projectContext = `Project: "${project.name}"\n${project.description || ''}`;
    const sessionHistory = project.sessions
      .filter((s) => s.id !== sessionId)
      .map((s) => `Session ${s.id.slice(0, 8)} (${s.createdAt.toISOString().split('T')[0]}): ${s.transcript.slice(0, 300)}`)
      .join('\n\n');

    const analysis = await analyzeTranscript(
      transcript,
      projectContext,
      sessionHistory,
      project.documents.map((d) => ({ id: d.id, name: d.name, content: d.content })),
      sessionId
    );

    await Promise.all([
      analysisRepository.createTangents(id, sessionId, analysis.tangents || []),
      analysisRepository.createPatterns(id, analysis.patterns || []),
      analysisRepository.createGaps(id, analysis.gaps || []),
      sessionsRepository.updateAnnotations(id, sessionId, JSON.stringify(analysis.annotations || [])),
    ]);

    return analysis;
  });
}
