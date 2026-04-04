import "server-only";

import { revalidatePath } from "next/cache";
import { after } from "next/server";

import { getPlaywrightAiTestMode } from "@/features/ai/test-mode";
import { runNoteEnrichment } from "@/features/notes/enrichment";
import { createDraftNote, publishNote, startNoteEnrichment } from "@/features/notes/service";
import type { NoteDraftInput } from "@/features/notes/types";

type NoteRouteRecord = {
  id: string;
  slug: string;
};

export function revalidateNotePaths(note: NoteRouteRecord) {
  revalidatePath("/");
  revalidatePath("/sitemap.xml");
  revalidatePath("/app");
  revalidatePath("/app/search");
  revalidatePath("/app/tags");
  revalidatePath(`/app/notes/${note.id}/edit`);
  revalidatePath(`/notes/${note.slug}`);
}

export function scheduleNoteEnrichment(note: NoteRouteRecord, attempt: number) {
  if (getPlaywrightAiTestMode() !== "passthrough") {
    return runNoteEnrichment(note.id, attempt);
  }

  after(async () => {
    await runNoteEnrichment(note.id, attempt);
    revalidateNotePaths(note);
  });
}

export async function queueNoteEnrichment(note: NoteRouteRecord) {
  const enrichedNote = await startNoteEnrichment(note.id);

  if (enrichedNote.enrichment.status === "pending") {
    await scheduleNoteEnrichment(note, enrichedNote.enrichment.attempts);
  }

  return enrichedNote;
}

export async function createOwnerNote(ownerId: string, input: NoteDraftInput, options?: { isPublished?: boolean }) {
  const createdNote = await createDraftNote(ownerId, input);
  const savedNote =
    options?.isPublished === true ? ((await publishNote(ownerId, createdNote.id)) ?? createdNote) : createdNote;

  const enrichedNote = await queueNoteEnrichment(savedNote);
  revalidateNotePaths(savedNote);

  return enrichedNote;
}
