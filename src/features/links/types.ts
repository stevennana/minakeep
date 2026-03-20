import type { EnrichmentState } from "@/features/enrichment/types";
import type { SavedTag } from "@/features/tags/types";

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
  enrichment: EnrichmentState;
  tags: SavedTag[];
  createdAt: Date;
  updatedAt: Date;
};
