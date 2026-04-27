'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { Project } from '@/lib/types';
import { AppHeader } from '@/components/layout/app-header';
import { Card, Container, GlassCard, PrimaryButton, SecondaryButton, Shell, StatusMessage, TextArea, TextInput, WombatMark } from '@/components/ui/primitives';
import { toneCopy } from '@/lib/copy/tone';
import { requestJson } from '@/lib/client/request';

function isProjectPayload(value: unknown): value is Project {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    typeof value.id === 'string' &&
    'name' in value &&
    typeof value.name === 'string'
  );
}

export default function HomePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [renameDesc, setRenameDesc] = useState('');
  const [renaming, setRenaming] = useState(false);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const newProjectFormRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    requestJson<Project[]>('/api/projects')
      .then(({ ok, data, status }) => {
        if (!ok || !Array.isArray(data)) {
          throw new Error(`Failed to load projects (${status})`);
        }
        setProjects(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load projects');
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!showNew) return;

    const frameId = requestAnimationFrame(() => {
      newProjectFormRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    });

    return () => cancelAnimationFrame(frameId);
  }, [showNew]);

  const createProject = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    setError(null);
    try {
      const res = await requestJson<Project | { error?: string }>('/api/projects', {
        method: 'POST',
        body: { name: newName, description: newDesc },
      });

      if (!res.ok || !res.data) {
        const failure = res.data as { error?: string } | null;
        throw new Error(failure?.error || 'Could not create project');
      }

      if (!isProjectPayload(res.data)) {
        console.error('[home] unexpected create-project response shape', typeof res.data);
        throw new Error('Could not create project');
      }

      const project = res.data;
      setProjects((prev) => [project, ...prev]);
      setNewName('');
      setNewDesc('');
      setShowNew(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create project');
    } finally {
      setCreating(false);
    }
  };

  const startRename = (project: Project, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setRenamingId(project.id);
    setRenameValue(project.name);
    setRenameDesc(project.description ?? '');
    setDeletingId(null);
    setError(null);
  };

  const cancelRename = () => {
    setRenamingId(null);
    setRenameValue('');
    setRenameDesc('');
  };

  const submitRename = async (projectId: string) => {
    if (!renameValue.trim()) return;
    setRenaming(true);
    setError(null);
    try {
      const res = await requestJson<Project | { error?: string }>(`/api/projects/${projectId}`, {
        method: 'PATCH',
        body: { name: renameValue.trim(), description: renameDesc },
      });

      if (!res.ok || !res.data) {
        const failure = res.data as { error?: string } | null;
        throw new Error(failure?.error || 'Could not rename project');
      }

      if (!isProjectPayload(res.data)) {
        throw new Error('Could not rename project');
      }

      const updated = res.data;
      setProjects((prev) => prev.map((p) => (p.id === projectId ? updated : p)));
      cancelRename();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not rename project');
    } finally {
      setRenaming(false);
    }
  };

  const startDelete = (projectId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDeletingId(projectId);
    setRenamingId(null);
    setError(null);
  };

  const cancelDelete = () => setDeletingId(null);

  const confirmDelete = async (projectId: string) => {
    setDeleting(true);
    setError(null);
    try {
      const res = await requestJson<{ success?: boolean; error?: string }>(`/api/projects/${projectId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const failure = res.data as { error?: string } | null;
        throw new Error(failure?.error || 'Could not delete project');
      }

      setProjects((prev) => prev.filter((p) => p.id !== projectId));
      setDeletingId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete project');
    } finally {
      setDeleting(false);
    }
  };

  const showAndScrollToNewProjectForm = () => {
    setShowNew(true);
  };

  return (
    <Shell>
      <Container>
        <AppHeader
          title="SkepticalWombat"
          subtitle={toneCopy.homeSubtitle}
          actions={
            <div className="flex items-center gap-2">
              <SecondaryButton onClick={() => signOut({ callbackUrl: '/sign-in' })}>
                Sign out
              </SecondaryButton>
            </div>
          }
        />

        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Your Projects</h2>
          <PrimaryButton onClick={() => setShowNew(true)}>+ New Project</PrimaryButton>
        </div>

        <div ref={newProjectFormRef}>
          {showNew && (
            <Card className="mb-6">
              <h3 className="text-lg font-semibold mb-4">New Project</h3>
              <TextInput
                type="text"
                placeholder="Project name..."
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="mb-3"
                onKeyDown={(e) => e.key === 'Enter' && createProject()}
                autoFocus
              />
              <TextArea
                placeholder="What is this project? (optional)"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                rows={3}
                className="mb-4 resize-none"
              />
              <div className="flex gap-3">
                <PrimaryButton onClick={createProject} disabled={creating || !newName.trim()}>
                  {creating ? 'Creating...' : 'Create'}
                </PrimaryButton>
                <SecondaryButton onClick={() => setShowNew(false)}>
                  Cancel
                </SecondaryButton>
              </div>
            </Card>
          )}
        </div>

        {error && <StatusMessage state="error" title="Something went wrong" description={error} />}

        {loading ? (
          <StatusMessage state="loading" title={toneCopy.homeLoadingProjects} />
        ) : projects.length === 0 ? (
          <GlassCard className="text-center py-16">
            <div className="flex justify-center mb-6">
              <WombatMark size={72} />
            </div>
            <p className="text-2xl font-bold mb-3 text-white">Your first story starts here.</p>
            <p className="text-app-fg-muted mb-2 max-w-md mx-auto">
              Talk freely — fragments, hunches, half-finished thoughts. The Wombat maps what connects, what&apos;s missing, and what keeps resurfacing.
            </p>
            <p className="text-app-fg-muted mb-8 max-w-md mx-auto text-sm">
              Create a project to begin. Everything else follows from recording.
            </p>
            <PrimaryButton onClick={showAndScrollToNewProjectForm} className="px-6 py-3 text-base">
              Create your first project
            </PrimaryButton>
          </GlassCard>
        ) : (
          <div className="grid gap-4">
            {projects.map((project) => (
              <div key={project.id} className="relative">
                {renamingId === project.id ? (
                  <Card className="border-indigo-700">
                    <h3 className="text-sm font-semibold text-app-fg-muted mb-3">Rename project</h3>
                    <TextInput
                      type="text"
                      placeholder="Project name..."
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      className="mb-3"
                      onKeyDown={(e) => e.key === 'Enter' && submitRename(project.id)}
                      autoFocus
                    />
                    <TextArea
                      placeholder="Description (optional)"
                      value={renameDesc}
                      onChange={(e) => setRenameDesc(e.target.value)}
                      rows={2}
                      className="mb-4 resize-none"
                    />
                    <div className="flex gap-3">
                      <PrimaryButton
                        onClick={() => submitRename(project.id)}
                        disabled={renaming || !renameValue.trim()}
                      >
                        {renaming ? 'Saving...' : 'Save'}
                      </PrimaryButton>
                      <SecondaryButton onClick={cancelRename}>Cancel</SecondaryButton>
                    </div>
                  </Card>
                ) : deletingId === project.id ? (
                  <Card className="border-red-700 bg-red-900/20">
                    <p className="text-sm text-red-300 mb-4">
                      Delete <strong>{project.name}</strong>? This cannot be undone.
                    </p>
                    <div className="flex gap-3">
                      <PrimaryButton
                        onClick={() => confirmDelete(project.id)}
                        disabled={deleting}
                        className="bg-red-600 hover:brightness-110 glow-lime-none"
                      >
                        {deleting ? 'Deleting...' : 'Delete permanently'}
                      </PrimaryButton>
                      <SecondaryButton onClick={cancelDelete}>Cancel</SecondaryButton>
                    </div>
                  </Card>
                ) : (
                  <Link
                    href={`/project/${project.id}`}
                    className="group block rounded-2xl border border-app-border bg-app-surface p-6 shadow-app transition duration-200 hover:border-app-border-strong hover:-translate-y-0.5"
                  >
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-lg font-semibold text-white transition-colors group-hover:text-indigo-300">
                          {project.name}
                        </h3>
                        {project.description && (
                          <p className="mt-1 line-clamp-1 text-sm text-app-fg-muted">{project.description}</p>
                        )}
                        <p className="mt-2 text-xs text-app-fg-muted">
                          Created {new Date(project.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 ml-3 shrink-0">
                        <button
                          onClick={(e) => startRename(project, e)}
                          aria-label={`Rename ${project.name}`}
                          className="rounded-lg p-1.5 text-app-fg-muted transition hover:bg-app-surface-strong hover:text-white"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={(e) => startDelete(project.id, e)}
                          aria-label={`Delete ${project.name}`}
                          className="rounded-lg p-1.5 text-app-fg-muted transition hover:bg-red-900/30 hover:text-red-400"
                        >
                          🗑️
                        </button>
                        <span className="text-app-fg-muted transition-colors group-hover:text-indigo-300 ml-1">→</span>
                      </div>
                    </div>
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </Container>
    </Shell>
  );
}
