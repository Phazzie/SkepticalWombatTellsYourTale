import { handleRoute } from '@/lib/server/http';
import { requireProjectHandler } from '@/lib/server/route-guard';
import { assertRawString, assertString, parseJsonBody } from '@/lib/server/validation';
import { notFound } from '@/lib/server/errors';
import { documentsRepository } from '@/lib/server/repositories/documents';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; docId: string }> }
) {
  return handleRoute(async () => {
    const { projectId, docId } = await requireProjectHandler(params);

    const existing = await documentsRepository.findByIdInProject(docId, projectId);
    if (!existing) {
      throw notFound('Document not found');
    }

    const body = await parseJsonBody<{ name?: unknown; content?: unknown; type?: unknown }>(request);
    const data: { name?: string; content?: string; type?: string } = {};

    if (body.name !== undefined) {
      data.name = assertString(body.name, 'name', { min: 1, max: 120 });
    }

    if (body.content !== undefined) {
      data.content = assertRawString(body.content, 'content', { min: 0, max: 200000 });
    }

    if (body.type !== undefined) {
      data.type = assertString(body.type, 'type', { min: 1, max: 60 });
    }

    return documentsRepository.update(docId, data);
  }, { request, operation: 'projects.documents.patch' });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; docId: string }> }
) {
  return handleRoute(async () => {
    const { projectId, docId } = await requireProjectHandler(params);

    const result = await documentsRepository.delete(docId, projectId);
    if (result.count === 0) {
      throw notFound('Document not found');
    }

    return { success: true };
  }, { request, operation: 'projects.documents.delete' });
}
