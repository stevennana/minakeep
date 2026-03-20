import "server-only";

import { linksRepo } from "@/features/links/repo";
import { notesRepo } from "@/features/notes/repo";

function normalizeSearchQuery(query: string | undefined) {
  return query?.trim() ?? "";
}

export async function searchOwnerContent(ownerId: string, rawQuery: string | undefined) {
  const query = normalizeSearchQuery(rawQuery);

  if (!query) {
    return {
      query,
      notes: [],
      links: []
    };
  }

  const [notes, links] = await Promise.all([
    notesRepo.searchForOwner(ownerId, query),
    linksRepo.searchForOwner(ownerId, query)
  ]);

  return {
    query,
    notes,
    links
  };
}
