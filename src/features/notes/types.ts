import type { EnrichmentState } from "@/features/enrichment/types";
import type { SavedTag } from "@/features/tags/types";

export type NoteDraftInput = {
  title: string;
  markdown: string;
};

export type NoteSummary = {
  id: string;
  title: string;
  excerpt: string;
  summary: string | null;
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
  summary: string | null;
  publishedAt: Date;
  updatedAt: Date;
};

export type PublishedNoteRecord = PublishedNoteSummary & {
  markdown: string;
  tags: SavedTag[];
};
