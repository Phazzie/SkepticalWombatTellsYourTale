export type QuestionStatus = 'pending' | 'answered' | 'dismissed';

export interface QuestionsPersistencePort {
  list(projectId: string, status?: QuestionStatus): Promise<
    Array<{ id: string; projectId: string; text: string; sessionRef: string | null; status: string; createdAt: Date; updatedAt: Date }>
  >;
  updateStatus(projectId: string, questionId: string, status: QuestionStatus): Promise<
    { id: string; projectId: string; text: string; sessionRef: string | null; status: string; createdAt: Date; updatedAt: Date } | null
  >;
  getGenerationContext(projectId: string): Promise<
    | {
        recentTranscriptContext: string;
        documentContext: string;
      }
    | null
  >;
  createGenerated(
    projectId: string,
    questions: Array<{ text: string; sessionRef?: string }>
  ): Promise<Array<{ id: string; projectId: string; text: string; sessionRef: string | null; status: string; createdAt: Date; updatedAt: Date }>>;
}
