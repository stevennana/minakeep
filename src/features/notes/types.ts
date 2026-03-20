export type NoteDraftInput = {
  title: string;
  markdown: string;
};

export type NoteSummary = {
  id: string;
  title: string;
  excerpt: string;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type NoteEditorRecord = NoteSummary & {
  slug: string;
  markdown: string;
};
