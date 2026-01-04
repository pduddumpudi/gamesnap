// Local storage helpers for draft games

export interface DraftGame {
  id: string;
  images: string[]; // base64 encoded images
  moves?: string[];
  metadata?: {
    white_player?: string;
    black_player?: string;
    result?: string;
  };
  timestamp: number;
}

const STORAGE_KEY = 'gamesnap_drafts';

export const saveDraft = (draft: DraftGame): void => {
  try {
    const drafts = getDrafts();
    const existingIndex = drafts.findIndex((d) => d.id === draft.id);

    if (existingIndex >= 0) {
      drafts[existingIndex] = draft;
    } else {
      drafts.push(draft);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
  } catch (error) {
    console.error('Error saving draft:', error);
  }
};

export const getDrafts = (): DraftGame[] => {
  try {
    const draftsJson = localStorage.getItem(STORAGE_KEY);
    return draftsJson ? JSON.parse(draftsJson) : [];
  } catch (error) {
    console.error('Error getting drafts:', error);
    return [];
  }
};

export const getDraft = (id: string): DraftGame | null => {
  const drafts = getDrafts();
  return drafts.find((d) => d.id === id) || null;
};

export const deleteDraft = (id: string): void => {
  try {
    const drafts = getDrafts();
    const filtered = drafts.filter((d) => d.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting draft:', error);
  }
};

export const clearAllDrafts = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing drafts:', error);
  }
};

export const generateDraftId = (): string => {
  return `draft_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};
