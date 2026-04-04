'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { Project } from '@/lib/types';
import { AppHeader } from '@/components/layout/app-header';
import { Card, Container, PrimaryButton, SecondaryButton, Shell, StatusMessage, TextArea, TextInput } from '@/components/ui/primitives';

export default function HomePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/projects')
      .then(async (r) => {
        if (!r.ok) throw new Error('Failed to load projects');
        return r.json();
      })
      .then((data) => {
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
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName, description: newDesc }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error || 'Could not create project');
      }

      const project = await res.json();
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
          subtitle="Tell Your Tale. The AI that makes your thinking harder."
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
          <StatusMessage state="loading" title="Loading projects..." />
        ) : projects.length === 0 ? (
          <Card className="text-center py-16">
            <div className="text-6xl mb-4">🎙️</div>
            <p className="text-xl mb-2 text-white">No projects yet</p>
            <p className="text-app-fg-muted">Create your first project to start talking.</p>
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
                    <h3 className="text-lg font-semibold text-white transition-colors group-hover:text-indigo-300">
                      {project.name}
                    </h3>
                    {project.description && (
                      <p className="mt-1 text-sm text-app-fg-muted">{project.description}</p>
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
