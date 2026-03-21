import "server-only";

import { listPublishedLinks } from "@/features/links/service";
import { listPublishedNotes } from "@/features/notes/service";
import { sortPublishedContent, toPublishedPublicLink, toPublishedPublicNote } from "@/features/public-content/types";

export async function listPublishedContent() {
  const [notes, links] = await Promise.all([listPublishedNotes(), listPublishedLinks()]);

  return sortPublishedContent([...notes.map(toPublishedPublicNote), ...links.map(toPublishedPublicLink)]);
}
