'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Session, AIAnnotation } from '@/lib/types';
import { AppHeader } from '@/components/layout/app-header';
import { AppBackLink, Card, Container, Shell, StatusMessage } from '@/components/ui/primitives';

export default function SessionsPage() {
  const { id } = useParams<{ id: string }>();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/projects/${id}/sessions`)
      .then(async (r) => {
        if (!r.ok) throw new Error('Failed to load sessions');
        return r.json();
      })
      .then((data) => {
        setSessions(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load sessions');
        setLoading(false);
      });
  }, [id]);

  const annotationColors: Record<string, string> = {
    important: 'bg-amber-500/20 border-amber-500/50 text-amber-300',
    connection: 'bg-blue-500/20 border-blue-500/50 text-blue-300',
    unfinished: 'bg-orange-500/20 border-orange-500/50 text-orange-300',
    tangent: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300',
    pattern: 'bg-purple-500/20 border-purple-500/50 text-purple-300',
  };

  const annotationIcons: Record<string, string> = {
    important: '⚡',
    connection: '🔗',
    unfinished: '🧵',
    tangent: '↪️',
    pattern: '🔁',
  };

  if (loading) {
    return <Shell><Container><StatusMessage state="loading" title="Loading sessions..." /></Container></Shell>;
  }

  return (
    <Shell>
      <Container>
        <AppBackLink href={`/project/${id}`} />
        <div className="mt-4" />
        <AppHeader title="Sessions" />

        {error && <StatusMessage state="error" title="Something went wrong" description={error} />}

        {sessions.length === 0 ? (
          <StatusMessage state="empty" title="No sessions yet" description="Record your first session to get started." />
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => {
              const annotations: AIAnnotation[] = Array.isArray(session.aiAnnotations)
                ? session.aiAnnotations
                : [];

              return (
                <Card key={session.id} className="overflow-hidden p-0">
                  <button
                    onClick={() => setExpandedId(expandedId === session.id ? null : session.id)}
                    className="w-full px-5 py-4 text-left transition hover:bg-app-surface-muted"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium text-white">Session — {new Date(session.createdAt).toLocaleString()}</p>
                        <p className="mt-0.5 text-sm text-app-fg-muted">{session.transcript.slice(0, 100)}...</p>
                      </div>
                      <span className="text-app-fg-muted">{expandedId === session.id ? '▲' : '▼'}</span>
                    </div>
                  </button>

                  {expandedId === session.id && (
                    <div className="border-t border-app-border px-5 py-4">
                      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-app-fg-muted">Raw Transcript</h3>
                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-app-fg">{session.transcript}</p>

                      {annotations.length > 0 && (
                        <div className="mt-4 border-t border-app-border pt-4">
                          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-app-fg-muted">🤖 AI Coach Notes</h3>
                          <div className="space-y-2">
                            {annotations.map((ann, i) => (
                              <div
                                key={i}
                                className={`rounded-lg border px-3 py-2 text-sm ${
                                  annotationColors[ann.type] || 'bg-app-surface-muted border-app-border text-app-fg'
                                }`}
                              >
                                <span className="mr-2">{annotationIcons[ann.type] || '💡'}</span>
                                {ann.text}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </Container>
    </Shell>
  );
}
