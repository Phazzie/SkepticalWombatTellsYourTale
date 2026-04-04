import { notFound } from '@/lib/server/errors';
import { AiPort } from '@/lib/server/ports/ai';
import { VoiceDraftPersistencePort } from '@/lib/server/ports/voice-draft';
import { openAiPort } from '@/lib/server/adapters/ai/openai-ai-port';
import { prismaVoiceDraftPort } from '@/lib/server/adapters/persistence/prisma-voice-draft-port';

export async function generateVoiceDraft(
  input: { projectId: string; documentId?: string; prompt: string },
  deps: { ai?: AiPort; persistence?: VoiceDraftPersistencePort } = {}
) {
  const ai = deps.ai || openAiPort;
  const persistence = deps.persistence || prismaVoiceDraftPort;

  const context = await persistence.getDraftContext(input.projectId, input.documentId);
  if (input.documentId && !context.documentExists) {
    throw notFound('Document not found');
  }

  const draft = await ai.generateVoicePreservedDraft(
    input.prompt,
    context.transcripts,
    context.documentContent
  );
  const drift = await ai.detectVoiceDrift(draft, context.transcripts);

  return { draft, drift };
}
