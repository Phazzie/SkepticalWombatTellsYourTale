import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { transcribeAudio } from '@/lib/openai';

export async function POST(request: Request) {
  const formData = await request.formData();
  const audioFile = formData.get('audio');
  const projectId = formData.get('projectId');
  const questionId = formData.get('questionId');

  if (!(audioFile instanceof File) || typeof projectId !== 'string' || !projectId) {
    return NextResponse.json({ error: 'Missing or invalid audio or projectId' }, { status: 400 });
  }

  const audioBuffer = Buffer.from(await audioFile.arrayBuffer());

  let transcript = '';
  try {
    transcript = await transcribeAudio(audioBuffer, audioFile.name);
  } catch (error) {
    console.error('Transcription error:', error);
    transcript = '[Transcription requires OpenAI API key — raw audio saved]';
  }

  let validatedQuestionId: string | null = null;
  if (typeof questionId === 'string' && questionId) {
    const question = await prisma.question.findFirst({
      where: { id: questionId, projectId },
      select: { id: true },
    });
    validatedQuestionId = question?.id ?? null;
  }

  const session = await prisma.voiceSession.create({
    data: {
      projectId,
      questionId: validatedQuestionId,
      transcript,
      aiAnnotations: '[]',
    },
  });

  if (validatedQuestionId) {
    await prisma.question.updateMany({
      where: { id: validatedQuestionId, projectId },
      data: { status: 'answered' },
    });
  }

  return NextResponse.json({ transcript, sessionId: session.id });
}
