import { ExportLevel } from '@/lib/types';
import { parseAiAnnotations } from '@/lib/server/mappers/ai-annotations';
import type { ExportProjectData } from '@/lib/server/repositories/export';

export function buildExportMarkdown(
  project: NonNullable<ExportProjectData>,
  options: {
    level: ExportLevel;
    includeTranscripts: boolean;
    includeAnnotations: boolean;
    includeGaps: boolean;
  }
): string {
  const { level, includeTranscripts, includeAnnotations, includeGaps } = options;

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

  return content;
}
