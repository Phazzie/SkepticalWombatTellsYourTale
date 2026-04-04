import { prisma } from '@/lib/db';
import { VoiceDraftPersistencePort } from '@/lib/server/ports/voice-draft';

export const prismaVoiceDraftPort: VoiceDraftPersistencePort = {
  async getDraftContext(projectId: string, documentId?: string) {
    const [sessions, document] = await Promise.all([
      prisma.voiceSession.findMany({
        where: { projectId },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      documentId
        ? prisma.document.findFirst({ where: { id: documentId, projectId } })
        : Promise.resolve(null),
    ]);

    return {
      transcripts: sessions.map((s) => s.transcript),
      documentContent: document?.content || '',
      documentExists: documentId ? Boolean(document) : true,
    };
  },
};
