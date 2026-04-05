import { projectsRepository } from '@/lib/server/repositories/projects';
import { parseAiAnnotations } from '@/lib/server/mappers/ai-annotations';
import { parseSessionRefs } from '@/lib/server/mappers/session-refs';
import { forbidden, notFound } from '@/lib/server/errors';
import { ensureProjectAccess } from '@/lib/server/auth';
import type { Project } from '@prisma/client';

interface ProjectsMutationRepository {
  createForUser(userId: string, name: string, description?: string | null): Promise<Project>;
  updateProject(projectId: string, data: { name?: string; description?: string | null }): Promise<Project>;
  deleteProject(projectId: string): Promise<unknown>;
}

type AccessCheckedProject = { userId: string };
type ProjectAccessChecker = (projectId: string, userId: string) => Promise<AccessCheckedProject>;

type ProjectsServiceMutationDeps = {
  repository?: ProjectsMutationRepository;
  ensureAccess?: ProjectAccessChecker;
};

export const projectsService = {
  async listForUser(userId: string) {
    return projectsRepository.listForUser(userId);
  },

  async createProject(userId: string, name: string, description: string | null, deps: ProjectsServiceMutationDeps = {}) {
    const repository = deps.repository || projectsRepository;
    return repository.createForUser(userId, name, description);
  },

  async updateProject(
    userId: string,
    projectId: string,
    data: { name?: string; description?: string | null },
    deps: ProjectsServiceMutationDeps = {}
  ) {
    const repository = deps.repository || projectsRepository;
    const ensureAccess = deps.ensureAccess || ensureProjectAccess;

    await ensureAccess(projectId, userId);
    return repository.updateProject(projectId, data);
  },

  async deleteProject(userId: string, projectId: string, deps: ProjectsServiceMutationDeps = {}) {
    const repository = deps.repository || projectsRepository;
    const ensureAccess = deps.ensureAccess || ensureProjectAccess;

    const project = await ensureAccess(projectId, userId);
    if (project.userId !== userId) {
      throw forbidden('Only project owner can delete project');
    }

    await repository.deleteProject(projectId);
    return { success: true };
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
