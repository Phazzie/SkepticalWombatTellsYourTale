'use client';

import { Pattern, Project } from '@/lib/types';
import { ProjectInsightsPage } from '@/components/project/insights-page';

export default function PatternsPage() {
  return (
    <ProjectInsightsPage<Pattern>
      title="Patterns"
      icon="🔁"
      pickItems={(project: Project) => project.patterns || []}
      emptyTitle="No patterns yet"
      emptyDescription="Patterns emerge after enough sessions and material."
      renderItem={(pattern) => (
        <div>
          <p className="text-sm text-purple-300">{pattern.description}</p>
          <p className="text-xs text-app-fg-muted mt-1">Seen in {pattern.sessionRefs.length} session(s)</p>
        </div>
      )}
    />
  );
}
