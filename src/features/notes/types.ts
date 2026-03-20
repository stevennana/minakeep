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

export type PublishedNoteSummary = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  publishedAt: Date;
  updatedAt: Date;
};

export type PublishedNoteRecord = PublishedNoteSummary & {
  markdown: string;
};
