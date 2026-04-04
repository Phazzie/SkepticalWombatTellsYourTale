import { prisma } from '@/lib/db';
import { handleRoute } from '@/lib/server/http';
import { requireUser } from '@/lib/server/auth';
import { requireProjectAccess } from '@/lib/server/services/project-access';
import { notFound } from '@/lib/server/errors';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleRoute(async () => {
    const { userId } = await requireUser();
    const { id } = await params;
    await requireProjectAccess(id, userId);

    const { level, includeTranscripts, includeAnnotations, includeGaps } = await request.json();

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        documents: true,
        sessions: { orderBy: { createdAt: 'asc' } },
        tangents: true,
        patterns: true,
        gaps: true,
      },
    });

    if (!project) {
      throw notFound('Project not found');
    }

    let content = `# ${project.name}\n`;
    if (project.description) content += `\n${project.description}\n`;
    content += `\nExported: ${new Date().toLocaleString()}\nExport level: ${level}\n\n---\n\n`;

    if (project.documents.length > 0) {
      content += '# Documents\n\n';
      for (const doc of project.documents) {
        content += `## ${doc.name} [${doc.type}]\n\n`;
        content += doc.content ? `${doc.content}\n\n` : '*No content yet*\n\n';
        content += '---\n\n';
      }
    }

    if ((level === 'raw' || level === 'full' || includeTranscripts) && project.sessions.length > 0) {
      content += '# Raw Voice Transcripts\n\n';
      for (const session of project.sessions) {
        content += `## Session — ${new Date(session.createdAt).toLocaleString()}\n\n`;
        content += `${session.transcript}\n\n`;

        if (includeAnnotations) {
          let annotations: Array<{ type: string; text: string }> = [];
          try {
            annotations = JSON.parse(session.aiAnnotations || '[]') as Array<{ type: string; text: string }>;
          } catch {
            annotations = [];
          }
          if (annotations.length > 0) {
            content += '### AI Notes\n\n';
            for (const ann of annotations) {
              content += `- **[${ann.type}]** ${ann.text}\n`;
            }
            content += '\n';
          }
        }
        content += '---\n\n';
      }
    }

    if (includeGaps || level === 'full') {
      const openGaps = project.gaps.filter((g) => !g.resolved);
      if (openGaps.length > 0) {
        content += '# Open Gaps\n\n';
        for (const gap of openGaps) {
          content += `- ${gap.description}${gap.documentRef ? ` *(${gap.documentRef})*` : ''}\n`;
        }
        content += '\n';
      }

      const pendingTangents = project.tangents.filter((t) => t.status === 'pending');
      if (pendingTangents.length > 0) {
        content += '# Dropped Threads\n\n';
        for (const t of pendingTangents) {
          content += `- **${t.thread}**: "${t.context}"\n`;
        }
        content += '\n';
      }
    }

    return new Response(content, {
      headers: {
        'Content-Type': 'text/markdown',
        'Content-Disposition': `attachment; filename="export-${level}-${Date.now()}.md"`,
      },
    });
  });
}
