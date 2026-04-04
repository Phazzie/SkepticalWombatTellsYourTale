import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateVoicePreservedDraft } from '@/lib/openai';

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
    return NextResponse.json({ draft });
  } catch (error) {
    console.error('Voice draft error:', error);
    return NextResponse.json({ draft: 'Voice draft generation requires OpenAI API key.' });
  }
}
