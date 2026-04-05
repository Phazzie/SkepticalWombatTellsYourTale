'use client';

import { Contradiction, Project } from '@/lib/types';
import { ProjectInsightsPage } from '@/components/project/insights-page';

export default function ContradictionsPage() {
  return (
    <ProjectInsightsPage<Contradiction>
      title="Open Contradictions"
      icon="⚖️"
      pickItems={(project: Project) => (project.contradictions || []).filter((item) => item.status === 'open')}
      emptyTitle="No open contradictions"
      emptyDescription="Potential conflicts across sessions are listed here."
      renderItem={(item) => (
        <div>
          <p className="text-sm text-red-300">{item.description}</p>
          <p className="text-xs text-app-fg-muted mt-1">Existing: {item.existing}</p>
          <p className="text-xs text-app-fg-muted mt-1">New: {item.new}</p>
        </div>
      )}
    />
  );
}
