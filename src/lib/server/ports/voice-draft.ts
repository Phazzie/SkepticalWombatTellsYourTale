export interface VoiceDraftPersistencePort {
  getDraftContext(
    projectId: string,
    documentId?: string
  ): Promise<{
    transcripts: string[];
    documentContent: string;
    documentExists: boolean;
  }>;
}
