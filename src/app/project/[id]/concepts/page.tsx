'use client';

import { Concept, Project } from '@/lib/types';
import { ProjectInsightsPage } from '@/components/project/insights-page';

export default function ConceptsPage() {
  return (
    <ProjectInsightsPage<Concept>
      title="Concept Candidates"
      icon="🏷️"
      pickItems={(project: Project) => (project.concepts || []).filter((concept) => !concept.approved)}
      emptyTitle="No pending concepts"
      emptyDescription="Concept candidates will be proposed as your project grows."
      renderItem={(concept) => (
        <div>
          <p className="text-sm text-green-300 font-medium">{concept.name}</p>
          <p className="text-xs text-app-fg-muted mt-1">{concept.definition}</p>
          <p className="text-xs text-app-fg-muted mt-1">
            <span
              className={`inline-block rounded px-1.5 py-0.5 text-xs font-medium ${
                concept.status === 'complete'
                  ? 'bg-green-900/50 text-green-300'
                  : concept.status === 'contradicted'
                    ? 'bg-red-900/50 text-red-300'
                    : 'bg-blue-900/50 text-blue-300'
              }`}
            >
              {concept.status}
            </span>
          </p>
        </div>
      )}
    />
  );
}
