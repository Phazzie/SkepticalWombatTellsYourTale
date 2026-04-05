'use client';

import { Project, Tangent } from '@/lib/types';
import { ProjectInsightsPage } from '@/components/project/insights-page';

export default function TangentsPage() {
  return (
    <ProjectInsightsPage<Tangent>
      title="Dropped Threads"
      icon="🧵"
      pickItems={(project: Project) => (project.tangents || []).filter((tangent) => tangent.status === 'pending')}
      emptyTitle="No dropped threads"
      emptyDescription="Dropped threads will appear here as sessions accumulate."
      renderItem={(tangent) => (
        <div>
          <p className="text-sm text-amber-300 font-medium">{tangent.thread}</p>
          <p className="text-xs text-app-fg-muted mt-1">&quot;{tangent.context}&quot;</p>
        </div>
      )}
    />
  );
}
