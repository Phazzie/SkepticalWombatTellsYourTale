import { SearchPersistencePort } from '@/lib/server/ports/search';
import { prismaSearchPort } from '@/lib/server/adapters/persistence/prisma-search-port';

export async function searchProject(
  projectId: string,
  rawQuery: string | undefined,
  deps: { persistence?: SearchPersistencePort } = {}
) {
  const q = rawQuery?.trim() || '';
  if (!q) {
    return { query: '', results: [] };
  }

  const persistence = deps.persistence || prismaSearchPort;
  const results = await persistence.searchProject(projectId, q);
  results.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));

  return { query: q, results };
}
