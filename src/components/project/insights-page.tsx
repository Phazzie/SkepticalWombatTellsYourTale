'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { AppHeader } from '@/components/layout/app-header';
import { AppBackLink, Card, Container, Shell, StatusMessage } from '@/components/ui/primitives';
import { requestJson } from '@/lib/client/request';
import { Project } from '@/lib/types';

export function ProjectInsightsPage<TItem>({
  title,
  icon,
  pickItems,
  emptyTitle,
  emptyDescription,
  renderItem,
}: {
  title: string;
  icon: string;
  pickItems: (project: Project) => TItem[];
  emptyTitle: string;
  emptyDescription: string;
  renderItem: (item: TItem) => React.ReactNode;
}) {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    requestJson<Project>(`/api/projects/${id}?include=all`)
      .then(({ ok, status, data }) => {
        if (!ok) {
          setError(`Failed to load project (${status})`);
          return;
        }
        setProject(data);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load project'))
      .finally(() => setLoading(false));
  }, [id]);

  const items = useMemo(() => (project ? pickItems(project) : []), [project, pickItems]);

  if (loading) {
    return <Shell><Container><StatusMessage state="loading" title={`Loading ${title.toLowerCase()}...`} /></Container></Shell>;
  }

  if (error) {
    return <Shell><Container><StatusMessage state="error" title="Something went wrong" description={error} /></Container></Shell>;
  }

  return (
    <Shell>
      <Container>
        <AppBackLink href={`/project/${id}`} />
        <div className="mt-4" />
        <AppHeader title={`${icon} ${title}`} />

        {items.length === 0 ? (
          <StatusMessage state="empty" title={emptyTitle} description={emptyDescription} />
        ) : (
          <div className="space-y-3">
            {items.map((item, index) => (
              <Card key={index}>{renderItem(item)}</Card>
            ))}
          </div>
        )}

        <div className="mt-6">
          <Link href={`/project/${id}/record`} className="text-sm text-indigo-400 hover:text-indigo-300">
            Record a new session →
          </Link>
        </div>
      </Container>
    </Shell>
  );
}
