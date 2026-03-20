import "server-only";

import { linksRepo } from "@/features/links/repo";
import { notesRepo } from "@/features/notes/repo";
import { tagsRepo } from "@/features/tags/repo";

export async function listOwnerTags(ownerId: string) {
  return tagsRepo.listForOwner(ownerId);
}

export async function listOwnerContentByTag(ownerId: string, tagName: string | null) {
  if (!tagName) {
    const [notes, links] = await Promise.all([notesRepo.listForOwner(ownerId), linksRepo.listForOwner(ownerId)]);

    return {
      notes,
      links
    };
  }

  const [notes, links] = await Promise.all([
    notesRepo.listForOwnerByTag(ownerId, tagName),
    linksRepo.listForOwnerByTag(ownerId, tagName)
  ]);

  return {
    notes,
    links
  };
}
