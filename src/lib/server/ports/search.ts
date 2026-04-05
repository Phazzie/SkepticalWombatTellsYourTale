export type SearchResultKind =
  | 'document'
  | 'session'
  | 'question'
  | 'concept'
  | 'gap'
  | 'tangent'
  | 'contradiction';

export interface SearchResultItem {
  kind: SearchResultKind;
  id: string;
  title: string;
  snippet: string;
  createdAt: Date;
}

export interface SearchPersistencePort {
  searchProject(projectId: string, query: string): Promise<SearchResultItem[]>;
}
