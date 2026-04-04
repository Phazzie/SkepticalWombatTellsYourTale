import { projectsRepository } from '@/lib/server/repositories/projects';
import { safeParseJson } from '@/lib/server/json';
import { notFound } from '@/lib/server/errors';

export const projectsService = {
  async listForUser(userId: string) {
    await projectsRepository.claimUnownedProjects(userId);
    return projectsRepository.listForUser(userId);
  },

  async getProject(userId: string, projectId: string, includeAll: boolean) {
    if (includeAll) {
      const project = await projectsRepository.getProjectWithAll(projectId);
      if (!project) throw notFound('Project not found');

      return {
        ...project,
        sessions: project.sessions.map((s) => ({
          ...s,
          aiAnnotations: safeParseJson(s.aiAnnotations, []),
        })),
        patterns: project.patterns.map((p) => ({
          ...p,
          sessionRefs: safeParseJson(p.sessionRefs, []),
        })),
      };
    }

    const projects = await projectsRepository.listForUser(userId);
    const project = projects.find((p) => p.id === projectId);
    if (!project) throw notFound('Project not found');
    return project;
  },
};
