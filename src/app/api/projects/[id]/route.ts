import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const url = new URL(request.url);
  const includeAll = url.searchParams.get('include') === 'all';

  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: includeAll
      ? {
          documents: true,
          sessions: { orderBy: { createdAt: 'desc' } },
          tangents: { orderBy: { createdAt: 'desc' } },
          patterns: { orderBy: { createdAt: 'desc' } },
          gaps: { orderBy: { createdAt: 'desc' } },
        }
      : undefined,
  });

  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(project);
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const data = await request.json();
  const project = await prisma.project.update({
    where: { id: params.id },
    data,
  });
  return NextResponse.json(project);
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  await prisma.project.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
