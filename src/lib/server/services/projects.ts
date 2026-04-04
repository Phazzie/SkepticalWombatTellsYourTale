import { projectsRepository } from '@/lib/server/repositories/projects';
import { parseAiAnnotations } from '@/lib/server/mappers/ai-annotations';
import { parseSessionRefs } from '@/lib/server/mappers/session-refs';
import { notFound } from '@/lib/server/errors';

export const projectsService = {
  async listForUser(userId: string) {
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
          aiAnnotations: parseAiAnnotations(s.aiAnnotations),
        })),
        patterns: project.patterns.map((p) => ({
          ...p,
          sessionRefs: parseSessionRefs(p.sessionRefs),
        })),
      };
    }

    const projects = await projectsRepository.listForUser(userId);
    const project = projects.find((p) => p.id === projectId);
    if (!project) throw notFound('Project not found');
    return project;
  },
};
