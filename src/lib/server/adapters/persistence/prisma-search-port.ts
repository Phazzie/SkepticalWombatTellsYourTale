import { SearchPersistencePort } from '@/lib/server/ports/search';
import { searchRepository } from '@/lib/server/repositories/search';

export const prismaSearchPort: SearchPersistencePort = {
  async searchProject(projectId: string, query: string) {
    return searchRepository.searchProject(projectId, query);
  },
};
