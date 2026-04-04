export interface Project {
  id: string;
  name: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
  documents?: Document[];
  sessions?: Session[];
  tangents?: Tangent[];
  patterns?: Pattern[];
  gaps?: Gap[];
}

export interface Document {
  id: string;
  projectId: string;
  name: string;
  type: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  id: string;
  projectId: string;
  audioUrl?: string | null;
  transcript: string;
  aiAnnotations: AIAnnotation[];
  createdAt: string;
  updatedAt: string;
  tangents?: Tangent[];
}

export interface AIAnnotation {
  timestamp?: number;
  text: string;
  type: 'important' | 'connection' | 'unfinished' | 'tangent' | 'pattern';
  reference?: string;
}

export interface Tangent {
  id: string;
  projectId: string;
  sessionId: string;
  thread: string;
  context: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: string;
  updatedAt: string;
}

export interface Pattern {
  id: string;
  projectId: string;
  description: string;
  sessionRefs: string[];
  acknowledged: boolean;
  createdAt: string;
}

export interface Gap {
  id: string;
  projectId: string;
  description: string;
  documentRef?: string | null;
  resolved: boolean;
  createdAt: string;
}

export interface AnalysisResult {
  documentSuggestion?: {
    documentId?: string;
    documentName: string;
    reason: string;
  };
  tangents: Array<{
    thread: string;
    context: string;
  }>;
  patterns: Array<{
    description: string;
    sessionRefs: string[];
  }>;
  gaps: Array<{
    description: string;
    documentRef?: string;
  }>;
  contradictions: Array<{
    description: string;
    existing: string;
    new: string;
  }>;
  questions: string[];
  annotations: AIAnnotation[];
  significance?: string;
  voicePreservedDraft?: string;
}
