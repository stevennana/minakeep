export type SavedTag = {
  id: string;
  name: string;
};

export type OwnerTagSummary = SavedTag & {
  noteCount: number;
  linkCount: number;
};
