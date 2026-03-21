import "server-only";

import { listPublishedLinks } from "@/features/links/service";
import { listPublishedNotes } from "@/features/notes/service";
import { filterSafePublishedContent, sortPublishedContent, toPublishedPublicLink, toPublishedPublicNote } from "@/features/public-content/types";

export async function listPublishedContent() {
  const [notes, links] = await Promise.all([listPublishedNotes(), listPublishedLinks()]);

  return sortPublishedContent(filterSafePublishedContent([...notes.map(toPublishedPublicNote), ...links.map(toPublishedPublicLink)]));
}
