'use client';

import { Gap, Project } from '@/lib/types';
import { ProjectInsightsPage } from '@/components/project/insights-page';
import { isOpenGap } from '@/components/project/dashboard/selectors';

export default function GapsPage() {
  return (
    <ProjectInsightsPage<Gap>
      title="Gaps"
      icon="🔍"
      pickItems={(project: Project) => (project.gaps || []).filter(isOpenGap)}
      emptyTitle="No open gaps detected"
      emptyDescription="Keep recording sessions and the system will flag specific missing pieces."
      renderItem={(gap) => (
        <div>
          <p className="text-sm text-red-300">{gap.description}</p>
          <p className="text-xs text-app-fg-muted mt-1">{gap.documentRef ? `In: ${gap.documentRef}` : 'No linked document'}</p>
        </div>
      )}
    />
  );
}
