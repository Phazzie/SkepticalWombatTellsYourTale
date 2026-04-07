'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { Project } from '@/lib/types';
import { Container, GlassCard, PrimaryButton, SecondaryButton, Shell, StatusMessage, TextArea, TextInput, WombatMark } from '@/components/ui/primitives';
import { toneCopy } from '@/lib/copy/tone';

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
        {/* Brand header */}
        <div className="mb-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-app-surface-muted p-2.5 border border-neon-lime/20 glow-lime">
              <WombatMark size={44} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">SkepticalWombat</h1>
              <p className="text-sm text-app-fg-muted">{toneCopy.homeSubtitle}</p>
            </div>
          </div>
          <SecondaryButton onClick={() => signOut({ callbackUrl: '/sign-in' })}>
            Sign out
          </SecondaryButton>
        </div>

        {/* Section header */}
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Your Projects</h2>
          <PrimaryButton onClick={() => setShowNew(true)}>
            + New Project
          </PrimaryButton>
        </div>

        {/* New project form */}
        {showNew && (
          <GlassCard className="mb-6 border-neon-lime/20">
            <h3 className="text-base font-semibold mb-4 text-white">New Project</h3>
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
              placeholder="What is this project about? (optional)"
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
          </GlassCard>
        )}

        {error && <StatusMessage state="error" title="Something went wrong" description={error} />}

        {loading ? (
          <StatusMessage state="loading" title={toneCopy.homeLoadingProjects} />
        ) : projects.length === 0 ? (
          <GlassCard className="text-center py-16">
            <div className="mx-auto mb-5 w-fit">
              <WombatMark size={56} />
            </div>
            <p className="text-xl mb-2 text-white">{toneCopy.homeEmptyProjectsTitle}</p>
            <p className="text-app-fg-muted text-sm">{toneCopy.homeEmptyProjectsDescription}</p>
          </GlassCard>
        ) : (
          <div className="grid gap-3">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/project/${project.id}`}
                className="group block rounded-2xl border border-app-border bg-app-surface p-5 shadow-app transition-all duration-200 hover:border-neon-lime/40 hover:-translate-y-0.5 hover:shadow-neon-lime"
              >
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <h3 className="text-base font-semibold text-white transition-colors group-hover:text-neon-lime truncate">
                      {project.name}
                    </h3>
                    {project.description && (
                      <p className="mt-1 text-sm text-app-fg-muted line-clamp-1">{project.description}</p>
                    )}
                    <p className="mt-2 text-xs text-app-fg-muted">
                      Created {new Date(project.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-app-fg-muted transition-colors group-hover:text-neon-lime ml-4 shrink-0 mt-0.5">→</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Container>
    </Shell>
  );
}
