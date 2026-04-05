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
  questions?: Question[];
  concepts?: Concept[];
  contradictions?: Contradiction[];
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
  questionId?: string | null;
  audioUrl?: string | null;
  transcript: string;
  aiAnnotations: AIAnnotation[];
  createdAt: string;
  updatedAt: string;
  tangents?: Tangent[];
  promptedBy?: Question | null;
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
  contractValidation?: {
    isValid: boolean;
    issues: string[];
    parseError?: string;
  };
  documentSuggestion?: {
    documentId?: string;
    documentName: string;
    reason: string;
  };
  tangents: Array<{
    thread: string;
    context: string;
    evidence: string;
  }>;
  patterns: Array<{
    description: string;
    sessionRefs: string[];
    evidence: string;
  }>;
  gaps: Array<{
    description: string;
    documentRef?: string;
    whyItMatters: string;
  }>;
  contradictions: Array<{
    description: string;
    existing: string;
    new: string;
    reason: string;
  }>;
  questions: string[];
  questionDetails?: Array<{
    text: string;
    contextAnchor: string;
  }>;
  concepts?: Array<{
    name: string;
    definition: string;
    sourceSession?: string;
    linkedDocument?: string;
    status: 'developing' | 'complete' | 'contradicted';
  }>;
  annotations: AIAnnotation[];
  significance?: string;
  significanceDetails?: {
    text: string;
    justification: string;
    confidence: number;
  };
  voicePreservedDraft?: string;
  voicePreservedDraftDetails?: {
    draft: string;
    justification: string;
    confidence: number;
  };
}

export interface Question {
  id: string;
  projectId: string;
  text: string;
  sessionRef?: string | null;
  status: 'pending' | 'answered' | 'dismissed';
  createdAt: string;
  updatedAt: string;
}

export interface Concept {
  id: string;
  projectId: string;
  name: string;
  definition: string;
  sourceSession?: string | null;
  linkedDocument?: string | null;
  status: 'developing' | 'complete' | 'contradicted';
  approved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Contradiction {
  id: string;
  projectId: string;
  description: string;
  existing: string;
  new: string;
  status: 'open' | 'explored' | 'dismissed';
  createdAt: string;
  updatedAt: string;
}
