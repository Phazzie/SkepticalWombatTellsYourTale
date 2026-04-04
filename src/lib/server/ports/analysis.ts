import { AnalysisResult } from '@/lib/types';

export interface AnalysisPersistencePort {
  getProjectAnalysisContext(projectId: string, sessionId: string): Promise<{
    projectName: string;
    projectDescription?: string | null;
    documents: Array<{ id: string; name: string; content: string }>;
    conceptContext: string;
    contradictionContext: string;
    sessionHistory: string;
  } | null>;
  persistAnalysisResult(projectId: string, sessionId: string, analysis: AnalysisResult): Promise<void>;
}
