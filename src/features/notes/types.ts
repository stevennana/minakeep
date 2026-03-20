import type { EnrichmentState } from "@/features/enrichment/types";
import type { SavedTag } from "@/features/tags/types";

export type NoteDraftInput = {
  title: string;
  markdown: string;
  tags: string;
};

export type NoteSummary = {
  id: string;
  title: string;
  excerpt: string;
  isPublished: boolean;
  enrichment: EnrichmentState;
  tags: SavedTag[];
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
