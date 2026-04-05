import { Concept, Contradiction, Gap, Pattern, Tangent } from '@/lib/types';

export interface ProjectSearchResult {
  kind: string;
  id: string;
  title: string;
  snippet: string;
}

export interface DashboardInsightsProps {
  id: string;
  pendingTangents: Tangent[];
  openGaps: Gap[];
  newPatterns: Pattern[];
  onResolveTangent: (tangentId: string) => Promise<void>;
  onResolveGap: (gapId: string) => Promise<void>;
}

export interface DashboardConceptsContradictionsProps {
  id: string;
  pendingConcepts: Concept[];
  openContradictions: Contradiction[];
  onApproveConcept: (conceptId: string) => Promise<void>;
  onMarkContradictionExplored: (contradictionId: string) => Promise<void>;
}
