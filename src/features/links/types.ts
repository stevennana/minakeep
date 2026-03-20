export type SavedTag = {
  id: string;
  name: string;
};

export type LinkDraftInput = {
  url: string;
  title: string;
  summary: string;
  tags: string;
};

export type SavedLinkSummary = {
  id: string;
  url: string;
  title: string;
  summary: string;
  tags: SavedTag[];
  createdAt: Date;
  updatedAt: Date;
};
