import "server-only";

import { countPublishedLinks, listPublishedLinks, listPublishedLinksPage } from "@/features/links/service";
import { countPublishedNotes, listPublishedNotes, listPublishedNotesPage } from "@/features/notes/service";
import { filterSafePublishedContent, sortPublishedContent, toPublishedPublicLink, toPublishedPublicNote } from "@/features/public-content/types";

export async function listPublishedContent() {
  const [notes, links] = await Promise.all([listPublishedNotes(), listPublishedLinks()]);

  return sortPublishedContent(filterSafePublishedContent([...notes.map(toPublishedPublicNote), ...links.map(toPublishedPublicLink)]));
}

export async function listPublishedContentPage({ limit, query }: { limit: number; query?: string }) {
  const [notes, links, publishedNotesCount, publishedLinksCount, matchingNotesCount, matchingLinksCount] = await Promise.all([
    listPublishedNotesPage(limit, query),
    listPublishedLinksPage(limit, query),
    countPublishedNotes(),
    countPublishedLinks(),
    countPublishedNotes(query),
    countPublishedLinks(query)
  ]);

  return {
    archiveCount: publishedNotesCount + publishedLinksCount,
    hasPublishedLinks: publishedLinksCount > 0,
    items: sortPublishedContent(filterSafePublishedContent([...notes.map(toPublishedPublicNote), ...links.map(toPublishedPublicLink)])).slice(0, limit),
    matchingCount: matchingNotesCount + matchingLinksCount
  };
}
