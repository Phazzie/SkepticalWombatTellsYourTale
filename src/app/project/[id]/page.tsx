'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Project, Tangent, Gap, Pattern } from '@/lib/types';
import { AppHeader } from '@/components/layout/app-header';
import { AppBackLink, Card, Container, Shell, StatusMessage } from '@/components/ui/primitives';

export default function ProjectPage() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/projects/${id}?include=all`)
      .then(async (r) => {
        if (!r.ok) {
          const data = (await r.json()) as { error?: string };
          throw new Error(data.error || 'Failed to load project');
        }
        return r.json();
      })
      .then((data) => {
        setProject(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load project');
        setLoading(false);
      });
  }, [id]);

  const resolveTangent = async (tangentId: string) => {
    await fetch(`/api/projects/${id}/tangents/${tangentId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'resolved' }),
    });
    setProject((prev) =>
      prev
        ? {
            ...prev,
            tangents: prev.tangents?.map((t) =>
              t.id === tangentId ? { ...t, status: 'resolved' as const } : t
            ),
          }
        : prev
    );
  };

  const resolveGap = async (gapId: string) => {
    await fetch(`/api/projects/${id}/gaps/${gapId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resolved: true }),
    });
    setProject((prev) =>
      prev
        ? {
            ...prev,
            gaps: prev.gaps?.map((g) =>
              g.id === gapId ? { ...g, resolved: true } : g
            ),
          }
        : prev
    );
  };

  if (loading) {
    return <Shell><Container><StatusMessage state="loading" title="Loading project..." /></Container></Shell>;
  }

  if (!project) {
    return <Shell><Container><StatusMessage state="error" title="Project not found" description={error ?? undefined} /></Container></Shell>;
  }

  const pendingTangents = project.tangents?.filter((t) => t.status === 'pending') || [];
  const openGaps = project.gaps?.filter((g) => !g.resolved) || [];
  const newPatterns = project.patterns?.filter((p) => !p.acknowledged) || [];

  return (
    <Shell>
      <Container wide>
        <AppBackLink href="/" label="Projects" />
        <div className="mt-4" />
        <AppHeader title={project.name} subtitle={project.description ?? undefined} />

        {/* Action Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Link
            href={`/project/${id}/record`}
            className="rounded-xl bg-app-accent p-5 text-center transition duration-200 hover:brightness-110"
          >
            <div className="text-3xl mb-2">🎙️</div>
            <div className="font-semibold">Record</div>
            <div className="text-indigo-300 text-xs mt-1">Voice session</div>
          </Link>
          <Link
            href={`/project/${id}/documents`}
            className="rounded-xl border border-app-border bg-app-surface-muted p-5 text-center transition duration-200 hover:border-app-border-strong"
          >
            <div className="text-3xl mb-2">📄</div>
            <div className="font-semibold">Documents</div>
            <div className="text-gray-400 text-xs mt-1">{project.documents?.length || 0} docs</div>
          </Link>
          <Link
            href={`/project/${id}/sessions`}
            className="rounded-xl border border-app-border bg-app-surface-muted p-5 text-center transition duration-200 hover:border-app-border-strong"
          >
            <div className="text-3xl mb-2">📼</div>
            <div className="font-semibold">Sessions</div>
            <div className="text-gray-400 text-xs mt-1">{project.sessions?.length || 0} sessions</div>
          </Link>
          <Link
            href={`/project/${id}/export`}
            className="rounded-xl border border-app-border bg-app-surface-muted p-5 text-center transition duration-200 hover:border-app-border-strong"
          >
            <div className="text-3xl mb-2">📤</div>
            <div className="font-semibold">Export</div>
            <div className="text-gray-400 text-xs mt-1">Export work</div>
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Tangent Tracker */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">🧵</span>
              <h2 className="font-semibold text-white">Dropped Threads</h2>
              {pendingTangents.length > 0 && (
                <span className="bg-amber-500 text-black text-xs font-bold px-2 py-0.5 rounded-full ml-auto">
                  {pendingTangents.length}
                </span>
              )}
            </div>
            {pendingTangents.length === 0 ? (
              <p className="text-app-fg-muted text-sm">No dropped threads yet.</p>
            ) : (
              <div className="space-y-3">
                {pendingTangents.slice(0, 5).map((tangent: Tangent) => (
                  <div key={tangent.id} className="rounded-lg bg-app-surface-muted p-3">
                    <p className="text-sm text-amber-400 font-medium">{tangent.thread}</p>
                    {tangent.context && (
                      <p className="text-xs text-gray-500 mt-1 italic">&quot;{tangent.context}&quot;</p>
                    )}
                    <div className="flex gap-2 mt-2">
                      <button onClick={() => resolveTangent(tangent.id)} className="text-xs text-green-400 hover:text-green-300">
                        ✓ Resolved
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Gap Detection */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">🔍</span>
              <h2 className="font-semibold text-white">Gaps</h2>
              {openGaps.length > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full ml-auto">
                  {openGaps.length}
                </span>
              )}
            </div>
            {openGaps.length === 0 ? (
              <p className="text-app-fg-muted text-sm">No gaps detected yet. Add more sessions.</p>
            ) : (
              <div className="space-y-3">
                {openGaps.slice(0, 5).map((gap: Gap) => (
                  <div key={gap.id} className="rounded-lg bg-app-surface-muted p-3">
                    <p className="text-sm text-red-400">{gap.description}</p>
                    {gap.documentRef && (
                      <p className="text-xs text-gray-500 mt-1">In: {gap.documentRef}</p>
                    )}
                    <button
                      onClick={() => resolveGap(gap.id)}
                      className="text-xs text-green-400 hover:text-green-300 mt-2"
                    >
                      ✓ Resolved
                    </button>
                  </div>
                ))}
                {openGaps.length > 5 && (
                  <p className="text-xs text-app-fg-muted">+{openGaps.length - 5} more gaps</p>
                )}
              </div>
            )}
          </Card>

          {/* Patterns */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">🔁</span>
              <h2 className="font-semibold text-white">Patterns</h2>
              {newPatterns.length > 0 && (
                <span className="bg-purple-500 text-white text-xs font-bold px-2 py-0.5 rounded-full ml-auto">
                  {newPatterns.length}
                </span>
              )}
            </div>
            {newPatterns.length === 0 ? (
              <p className="text-app-fg-muted text-sm">No patterns detected yet.</p>
            ) : (
              <div className="space-y-3">
                {newPatterns.slice(0, 5).map((pattern: Pattern) => (
                  <div key={pattern.id} className="rounded-lg bg-app-surface-muted p-3">
                    <p className="text-sm text-purple-400">{pattern.description}</p>
                    <p className="text-xs text-app-fg-muted mt-1">
                      Seen in {pattern.sessionRefs.length} session(s)
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Questions */}
        <Card className="mt-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">❓</span>
            <h2 className="font-semibold text-white">Questions for You</h2>
          </div>
          <Link
            href={`/project/${id}/questions`}
            className="text-sm text-indigo-300 hover:text-indigo-200"
          >
            View all questions and prompts →
          </Link>
        </Card>
      </Container>
    </Shell>
  );
}
