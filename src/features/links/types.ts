import type { EnrichmentState } from "@/features/enrichment/types";
import type { SavedTag } from "@/features/tags/types";

export type LinkDraftInput = {
  url: string;
  title: string;
};

export type SavedLinkSummary = {
  id: string;
  url: string;
  title: string;
  summary: string | null;
  isPublished: boolean;
  publishedAt: Date | null;
  enrichment: EnrichmentState;
  tags: SavedTag[];
  createdAt: Date;
  updatedAt: Date;
};

export type PublishedLinkSummary = {
  id: string;
  url: string;
  title: string;
  summary: string | null;
  publishedAt: Date;
  updatedAt: Date;
  tags: SavedTag[];
};
