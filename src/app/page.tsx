'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { Project } from '@/lib/types';
import { AppHeader } from '@/components/layout/app-header';
import { Card, Container, PrimaryButton, SecondaryButton, Shell, StatusMessage, TextArea, TextInput } from '@/components/ui/primitives';
import { toneCopy } from '@/lib/copy/tone';
import { requestJson } from '@/lib/client/request';

export default function HomePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

      if (Array.isArray(res.data)) {
        throw new Error('Unexpected create-project response shape (array)');
      }

      const project = res.data as Project;
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

        {error && <StatusMessage state="error" title="Something went wrong" description={error} />}

        {loading ? (
          <StatusMessage state="loading" title={toneCopy.homeLoadingProjects} />
        ) : projects.length === 0 ? (
          <Card className="text-center py-16">
            <div className="text-6xl mb-4">🎙️</div>
            <p className="text-xl mb-2 text-white">{toneCopy.homeEmptyProjectsTitle}</p>
            <p className="text-app-fg-muted">{toneCopy.homeEmptyProjectsDescription}</p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/project/${project.id}`}
                className="group block rounded-2xl border border-app-border bg-app-surface p-6 shadow-app transition duration-200 hover:border-app-border-strong hover:-translate-y-0.5"
              >
                <div className="flex items-start justify-between">
                  <div>
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
                  <span className="text-app-fg-muted transition-colors group-hover:text-indigo-300">→</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Container>
    </Shell>
  );
}
