import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import {
  asOptionalNullableString,
  asRequiredString,
  readJsonObjectBody,
  RequestValidationError,
} from '@/lib/api-contract';

export async function GET() {
  const projects = await prisma.project.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(projects);
}

export async function POST(request: Request) {
  try {
    const body = await readJsonObjectBody(request);
    const name = asRequiredString(body.name, 'name');
    const description = asOptionalNullableString(body.description, 'description');
    const project = await prisma.project.create({
      data: { name, ...(description !== undefined && { description }) },
    });
    return NextResponse.json(project);
  } catch (error) {
    if (error instanceof RequestValidationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    throw error;
  }
}
