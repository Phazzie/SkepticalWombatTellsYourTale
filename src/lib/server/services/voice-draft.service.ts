import { badRequest, notFound } from '@/lib/server/errors';
import { AiPort } from '@/lib/server/ports/ai';
import { VoiceDraftPersistencePort } from '@/lib/server/ports/voice-draft';
import { openAiPort } from '@/lib/server/adapters/ai/openai-ai-port';
import { prismaVoiceDraftPort } from '@/lib/server/adapters/persistence/prisma-voice-draft-port';
import { log } from '@/lib/server/logger';

export async function generateVoiceDraft(
  input: { projectId: string; documentId?: string; prompt: string },
  deps: { ai?: AiPort; persistence?: VoiceDraftPersistencePort } = {}
) {
  if (!deps.ai && !process.env.OPENAI_API_KEY) {
    log('warn', 'Voice draft requested without OPENAI_API_KEY');
    throw badRequest('Voice draft unavailable: configure OPENAI_API_KEY');
  }

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
