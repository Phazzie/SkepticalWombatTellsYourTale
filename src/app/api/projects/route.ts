import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  const projects = await prisma.project.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(projects);
}

export async function POST(request: Request) {
  const { name, description } = await request.json();
  const project = await prisma.project.create({
    data: { name, description },
  });
  return NextResponse.json(project);
}
