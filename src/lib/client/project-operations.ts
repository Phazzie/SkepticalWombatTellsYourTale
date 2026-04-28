import { requestJson } from './request';
import { Project } from '@/lib/types';

export function isProjectPayload(value: unknown): value is Project {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    typeof value.id === 'string' &&
    'name' in value &&
    typeof value.name === 'string'
  );
}

export async function updateProjectName(
  projectId: string,
  name: string,
  description?: string | null,
): Promise<Project> {
  const res = await requestJson<Project | { error?: string }>(`/api/projects/${projectId}`, {
    method: 'PATCH',
    body: { name: name.trim(), description },
  });

  if (!res.ok || !res.data) {
    const failure = res.data as { error?: string } | null;
    throw new Error(failure?.error || 'Could not rename project');
  }

  if (!isProjectPayload(res.data)) {
    throw new Error('Could not rename project');
  }

  return res.data;
}

export async function deleteProject(projectId: string): Promise<void> {
  const res = await requestJson<{ success?: boolean; error?: string }>(`/api/projects/${projectId}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    const failure = res.data as { error?: string } | null;
    throw new Error(failure?.error || 'Could not delete project');
  }
}
