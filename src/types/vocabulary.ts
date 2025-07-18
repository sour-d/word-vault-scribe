export interface VocabularyEntry {
  id: string;
  term: string;
  meaning: string;
  example: string;
  sectionId: string;
  createdAt: string;
}

export interface VocabularySection {
  id: string;
  name: string;
  createdAt: string;
  entryCount?: number;
}

export interface User {
  username: string;
  isAuthenticated: boolean;
}