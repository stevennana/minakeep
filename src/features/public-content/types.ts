import type { PublishedLinkSummary } from "@/features/links/types";
import type { PublishedNoteSummary } from "@/features/notes/types";
import type { SavedTag } from "@/features/tags/types";

export type PublicContentKind = "note" | "link";

type PublishedPublicContentBase = {
  id: string;
  kind: PublicContentKind;
  title: string;
  summary: string | null;
  publishedAt: Date;
  updatedAt: Date;
  tags: SavedTag[];
};

export type PublishedPublicNote = PublishedPublicContentBase & {
  kind: "note";
  excerpt: string;
  slug: string;
};

export type PublishedPublicLink = PublishedPublicContentBase & {
  kind: "link";
  url: string;
};

export type PublishedPublicContent = PublishedPublicNote | PublishedPublicLink;

export function toPublishedPublicNote(note: PublishedNoteSummary): PublishedPublicNote {
  return {
    id: note.id,
    kind: "note",
    title: note.title,
    summary: note.summary,
    publishedAt: note.publishedAt,
    updatedAt: note.updatedAt,
    tags: note.tags,
    excerpt: note.excerpt,
    slug: note.slug
  };
}

export function toPublishedPublicLink(link: PublishedLinkSummary): PublishedPublicLink {
  return {
    id: link.id,
    kind: "link",
    title: link.title,
    summary: link.summary,
    publishedAt: link.publishedAt,
    updatedAt: link.updatedAt,
    tags: link.tags,
    url: link.url
  };
}

export function comparePublishedContent(a: PublishedPublicContent, b: PublishedPublicContent) {
  const publishedAtDiff = b.publishedAt.getTime() - a.publishedAt.getTime();

  if (publishedAtDiff !== 0) {
    return publishedAtDiff;
  }

  const updatedAtDiff = b.updatedAt.getTime() - a.updatedAt.getTime();

  if (updatedAtDiff !== 0) {
    return updatedAtDiff;
  }

  return a.title.localeCompare(b.title);
}

export function sortPublishedContent(items: PublishedPublicContent[]) {
  return [...items].sort(comparePublishedContent);
}
