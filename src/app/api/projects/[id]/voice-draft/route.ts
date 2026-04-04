import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateVoicePreservedDraft, detectVoiceDrift } from '@/lib/openai';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { documentId, prompt } = await request.json();

  const [sessions, document] = await Promise.all([
    prisma.session.findMany({
      where: { projectId: id },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
    documentId
      ? prisma.document.findFirst({ where: { id: documentId, projectId: id } })
      : Promise.resolve(null),
  ]);

  if (documentId && !document) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 });
  }

  const transcripts = sessions.map((s) => s.transcript);
  const docContext = document ? document.content : '';

  try {
    const draft = await generateVoicePreservedDraft(prompt, transcripts, docContext);
    const drift = await detectVoiceDrift(draft, transcripts);
    return NextResponse.json({ draft, drift });
  } catch (error) {
    console.error('Voice draft error:', error);
    const isErrorObject = typeof error === 'object' && error !== null;
    const errorStatus = isErrorObject ? (error as { status?: unknown }).status : undefined;
    const errorCode = isErrorObject ? (error as { code?: unknown }).code : undefined;
    const isMissingOpenAiKey = errorStatus === 401 || errorCode === 'invalid_api_key';

    if (isMissingOpenAiKey) {
      return NextResponse.json(
        { draft: 'Voice draft generation requires OpenAI API key.', drift: null },
        { status: 500 }
      );
    }

    const failureReason = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { draft: `Voice draft generation failed: ${failureReason}`, drift: null },
      { status: 500 }
    );
  }
}
