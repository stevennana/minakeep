import "server-only";

import { notesRepo } from "@/features/notes/repo";
import { createNoteExcerpt } from "@/features/notes/markdown";
import type { NoteDraftInput } from "@/features/notes/types";
import { createUniqueNoteSlug } from "@/features/notes/slug";

function normalizeTitle(title: string) {
  const trimmedTitle = title.trim();

  return trimmedTitle || "Untitled note";
}

export async function listOwnerNotes(ownerId: string) {
  return notesRepo.listForOwner(ownerId);
}

export async function getOwnerNoteForEditor(ownerId: string, id: string) {
  return notesRepo.findByIdForOwner(ownerId, id);
}

export async function createDraftNote(ownerId: string, input: NoteDraftInput) {
  const title = normalizeTitle(input.title);
  const markdown = input.markdown;
  const existingSlugs = await notesRepo.listSlugsForOwner(ownerId);

  return notesRepo.create(ownerId, {
    title,
    slug: createUniqueNoteSlug(title, existingSlugs),
    markdown,
    excerpt: createNoteExcerpt(markdown, title)
  });
}

export async function updateDraftNote(ownerId: string, id: string, input: NoteDraftInput) {
  const existingNote = await notesRepo.findByIdForOwner(ownerId, id);

  if (!existingNote) {
    return null;
  }

  const title = normalizeTitle(input.title);
  const markdown = input.markdown;
  const existingSlugs = await notesRepo.listSlugsForOwner(ownerId);
  const siblingSlugs = existingSlugs.filter((slug) => slug !== existingNote.slug);

  return notesRepo.update(id, {
    title,
    slug: createUniqueNoteSlug(title, siblingSlugs),
    markdown,
    excerpt: createNoteExcerpt(markdown, title)
  });
}
