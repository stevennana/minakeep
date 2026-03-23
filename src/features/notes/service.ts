import "server-only";

import { requestEnrichment, retryEnrichment } from "@/features/enrichment/service";
import { claimNoteImageAssetsForNote } from "@/features/media/service";
import { notesRepo } from "@/features/notes/repo";
import { createNoteExcerpt } from "@/features/notes/markdown";
import type { NoteDraftInput } from "@/features/notes/types";
import { createUniqueNoteSlug } from "@/features/notes/slug";

export class PublishedNoteDeleteForbiddenError extends Error {
  constructor() {
    super("published-note-delete-forbidden");
    this.name = "PublishedNoteDeleteForbiddenError";
  }
}

function normalizeTitle(title: string) {
  const trimmedTitle = title.trim();

  return trimmedTitle || "Untitled note";
}

export async function listOwnerNotes(ownerId: string) {
  return notesRepo.listForOwner(ownerId);
}

export async function listPublishedNotes() {
  const notes = await notesRepo.listPublished();

  return notes.filter((note): note is typeof note & { publishedAt: Date } => note.publishedAt !== null);
}

export async function getOwnerNoteForEditor(ownerId: string, id: string) {
  return notesRepo.findByIdForOwner(ownerId, id);
}

export async function getPublishedNoteBySlug(slug: string) {
  const note = await notesRepo.findPublishedBySlug(slug);

  if (!note?.publishedAt) {
    return null;
  }

  return note;
}

export async function createDraftNote(ownerId: string, input: NoteDraftInput) {
  const title = normalizeTitle(input.title);
  const markdown = input.markdown;
  const existingSlugs = await notesRepo.listSlugsForOwner(ownerId);
  const note = await notesRepo.create(ownerId, {
    title,
    slug: createUniqueNoteSlug(title, existingSlugs),
    markdown,
    excerpt: createNoteExcerpt(markdown, title)
  });

  await claimNoteImageAssetsForNote(ownerId, note.id, markdown);

  return note;
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
  const note = await notesRepo.update(id, {
    title,
    slug: createUniqueNoteSlug(title, siblingSlugs),
    markdown,
    excerpt: createNoteExcerpt(markdown, title)
  });

  await claimNoteImageAssetsForNote(ownerId, note.id, markdown);

  return note;
}

export async function publishNote(ownerId: string, id: string) {
  const existingNote = await notesRepo.findByIdForOwner(ownerId, id);

  if (!existingNote) {
    return null;
  }

  if (existingNote.isPublished) {
    return existingNote;
  }

  return notesRepo.updatePublication(id, true);
}

export async function unpublishNote(ownerId: string, id: string) {
  const existingNote = await notesRepo.findByIdForOwner(ownerId, id);

  if (!existingNote) {
    return null;
  }

  if (!existingNote.isPublished) {
    return existingNote;
  }

  return notesRepo.updatePublication(id, false);
}

export async function deleteDraftNote(ownerId: string, id: string) {
  const existingNote = await notesRepo.findByIdForOwner(ownerId, id);

  if (!existingNote) {
    return null;
  }

  if (existingNote.isPublished) {
    throw new PublishedNoteDeleteForbiddenError();
  }

  return notesRepo.delete(id);
}

export async function retryNoteEnrichment(ownerId: string, id: string) {
  const note = await notesRepo.findByIdForOwner(ownerId, id);

  if (!note) {
    return null;
  }

  return retryEnrichment(notesRepo, id, note);
}

export async function startNoteEnrichment(id: string) {
  return requestEnrichment(notesRepo, id);
}
