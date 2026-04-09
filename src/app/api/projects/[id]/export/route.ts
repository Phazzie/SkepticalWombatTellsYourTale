import { handleRoute } from '@/lib/server/http';
import { badRequest, notFound } from '@/lib/server/errors';
import { requireProjectHandler } from '@/lib/server/route-guard';
import { exportRepository } from '@/lib/server/repositories/export';
import { buildExportMarkdown } from '@/lib/server/export-renderer';
import { parseJsonBody } from '@/lib/server/validation';
import { EXPORT_LEVELS, type ExportLevel } from '@/lib/types';

const EXPORT_LEVEL_SET = new Set<string>(EXPORT_LEVELS);

function isExportLevel(value: string): value is ExportLevel {
  return EXPORT_LEVEL_SET.has(value);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleRoute(async () => {
    const { projectId } = await requireProjectHandler(params);

    const { level, includeTranscripts, includeAnnotations, includeGaps } = await parseJsonBody<{
      level?: unknown;
      includeTranscripts?: unknown;
      includeAnnotations?: unknown;
      includeGaps?: unknown;
    }>(request);
    const normalizedLevel = typeof level === 'string' ? level : 'full';
    if (!isExportLevel(normalizedLevel)) {
      throw badRequest('level must be one of: raw, structured, polished, full');
    }

    const project = await exportRepository.getProjectForExport(projectId);
    if (!project) {
      throw notFound('Project not found');
    }

    const content = buildExportMarkdown(project, {
      level: normalizedLevel,
      includeTranscripts: includeTranscripts === true,
      includeAnnotations: includeAnnotations === true,
      includeGaps: includeGaps === true,
    });

    return new Response(content, {
      headers: {
        'Content-Type': 'text/markdown',
        'Content-Disposition': `attachment; filename="export-${normalizedLevel}-${Date.now()}.md"`,
      },
    });
  }, { request, operation: 'projects.export' });
}
