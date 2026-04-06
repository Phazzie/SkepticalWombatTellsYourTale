'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Session, AIAnnotation } from '@/lib/types';
import { AnnotationList } from '@/components/annotations/annotation-list';
import { AppHeader } from '@/components/layout/app-header';
import { AppBackLink, Card, Container, Shell, StatusMessage } from '@/components/ui/primitives';
import { toneCopy } from '@/lib/copy/tone';

export default function SessionsPage() {
  const { id } = useParams<{ id: string }>();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/projects/${id}/sessions`)
      .then(async (r) => {
        if (!r.ok) {
          const data = (await r.json()) as { error?: string };
          throw new Error(data.error || 'Failed to load sessions');
        }
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

  if (loading) {
    return <Shell><Container><StatusMessage state="loading" title={toneCopy.sessionsLoading} /></Container></Shell>;
  }

  return (
    <Shell>
      <Container>
        <AppBackLink href={`/project/${id}`} />
        <div className="mt-4" />
        <AppHeader title="Sessions" />

        {error && <StatusMessage state="error" title="Something went wrong" description={error} />}

        {sessions.length === 0 ? (
          <StatusMessage
            state="empty"
            title={toneCopy.sessionsEmptyTitle}
            description={toneCopy.sessionsEmptyDescription}
          />
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
                          <AnnotationList annotations={annotations} />
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
