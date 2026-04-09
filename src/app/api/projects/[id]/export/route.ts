import { prisma } from '@/lib/db';
import { handleRoute } from '@/lib/server/http';
import { requireUser } from '@/lib/server/auth';
import { requireProjectAccess } from '@/lib/server/services/project-access';
import { badRequest, notFound } from '@/lib/server/errors';
import { parseAiAnnotations } from '@/lib/server/mappers/ai-annotations';
import { parseJsonBody } from '@/lib/server/validation';
import { EXPORT_LEVELS, type ExportLevel } from '@/lib/types';

const EXPORT_LEVEL_SET = new Set<string>(EXPORT_LEVELS);
const TRUE_EXPORT_FLAG_VALUES = new Set(['true', '1']);
const FALSE_EXPORT_FLAG_VALUES = new Set(['false', '0']);
const EXPORT_FLAG_ERROR_MESSAGE = 'must be a boolean-like value (true/false or 1/0)';

function isExportLevel(value: string): value is ExportLevel {
  return EXPORT_LEVEL_SET.has(value);
}

function parseExportIncludeFlag(value: unknown, field: string): boolean {
  if (value === undefined || value === null) {
    return false;
  }
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'number') {
    if (value === 1) {
      return true;
    }
    if (value === 0) {
      return false;
    }
    throw badRequest(`${field} ${EXPORT_FLAG_ERROR_MESSAGE}`);
  }
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (TRUE_EXPORT_FLAG_VALUES.has(normalized)) {
      return true;
    }
    if (FALSE_EXPORT_FLAG_VALUES.has(normalized)) {
      return false;
    }
    throw badRequest(`${field} ${EXPORT_FLAG_ERROR_MESSAGE}`);
  }
  throw badRequest(`${field} ${EXPORT_FLAG_ERROR_MESSAGE}`);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleRoute(async () => {
    const { userId } = await requireUser();
    const { id } = await params;
    await requireProjectAccess(id, userId);

    const { level, includeTranscripts, includeAnnotations, includeGaps } = await parseJsonBody<{
      level?: unknown;
      includeTranscripts?: unknown;
      includeAnnotations?: unknown;
      includeGaps?: unknown;
    }>(request);
    const normalizedLevel = typeof level === 'string' ? level : 'full';
    if (!isExportLevel(normalizedLevel)) {
      throw badRequest(`level must be one of: ${EXPORT_LEVELS.join(', ')}`);
    }
    const shouldIncludeTranscripts = parseExportIncludeFlag(includeTranscripts, 'includeTranscripts');
    const shouldIncludeAnnotations = parseExportIncludeFlag(includeAnnotations, 'includeAnnotations');
    const shouldIncludeGaps = parseExportIncludeFlag(includeGaps, 'includeGaps');

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
    content += `\nExported: ${new Date().toLocaleString()}\nExport level: ${normalizedLevel}\n\n---\n\n`;

    if (project.documents.length > 0) {
      content += '# Documents\n\n';
      for (const doc of project.documents) {
        content += `## ${doc.name} [${doc.type}]\n\n`;
        content += doc.content ? `${doc.content}\n\n` : '*No content yet*\n\n';
        content += '---\n\n';
      }
    }

    if ((normalizedLevel === 'raw' || normalizedLevel === 'full' || shouldIncludeTranscripts) && project.sessions.length > 0) {
      content += '# Raw Voice Transcripts\n\n';
      for (const session of project.sessions) {
        content += `## Session — ${new Date(session.createdAt).toLocaleString()}\n\n`;
        content += `${session.transcript}\n\n`;

        if (shouldIncludeAnnotations) {
          const annotations = parseAiAnnotations(session.aiAnnotations);
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

    if (shouldIncludeGaps || normalizedLevel === 'full') {
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
        'Content-Disposition': `attachment; filename="export-${normalizedLevel}-${Date.now()}.md"`,
      },
    });
  }, { request, operation: 'projects.export' });
}
