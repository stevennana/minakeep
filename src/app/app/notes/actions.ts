"use server";

import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { after } from "next/server";

import { runNoteEnrichment } from "@/features/notes/enrichment";
import {
  createDraftNote,
  publishNote,
  retryNoteEnrichment,
  startNoteEnrichment,
  unpublishNote,
  updateDraftNote
} from "@/features/notes/service";
import { requireOwnerSession } from "@/lib/auth/owner-session";

function getNoteInput(formData: FormData) {
  return {
    title: String(formData.get("title") ?? ""),
    markdown: String(formData.get("markdown") ?? "")
  };
}

function revalidateNotePaths(note: { id: string; slug: string }) {
  revalidatePath("/");
  revalidatePath("/app");
  revalidatePath("/app/search");
  revalidatePath("/app/tags");
  revalidatePath(`/app/notes/${note.id}/edit`);
  revalidatePath(`/notes/${note.slug}`);
}

function scheduleNoteEnrichment(note: { id: string; slug: string }, attempt: number) {
  after(async () => {
    await runNoteEnrichment(note.id, attempt);
    revalidateNotePaths(note);
  });
}

async function queueNoteEnrichment(note: { id: string; slug: string }) {
  const enrichedNote = await startNoteEnrichment(note.id);

  if (enrichedNote.enrichment.status === "pending") {
    scheduleNoteEnrichment(note, enrichedNote.enrichment.attempts);
  }

  return enrichedNote;
}

export async function createNoteAction(formData: FormData) {
  const owner = await requireOwnerSession();
  const note = await createDraftNote(owner.id, getNoteInput(formData));
  await queueNoteEnrichment(note);

  revalidateNotePaths(note);
  redirect(`/app/notes/${note.id}/edit?saved=1`);
}

export async function updateNoteAction(noteId: string, formData: FormData) {
  const owner = await requireOwnerSession();
  const note = await updateDraftNote(owner.id, noteId, getNoteInput(formData));

  if (!note) {
    notFound();
  }

  await queueNoteEnrichment(note);
  revalidateNotePaths(note);
  redirect(`/app/notes/${noteId}/edit?saved=1`);
}

export async function publishNoteAction(noteId: string) {
  const owner = await requireOwnerSession();
  const note = await publishNote(owner.id, noteId);

  if (!note) {
    notFound();
  }

  revalidateNotePaths(note);
  redirect(`/app/notes/${noteId}/edit?published=1`);
}

export async function unpublishNoteAction(noteId: string) {
  const owner = await requireOwnerSession();
  const note = await unpublishNote(owner.id, noteId);

  if (!note) {
    notFound();
  }

  revalidateNotePaths(note);
  redirect(`/app/notes/${noteId}/edit?unpublished=1`);
}

export async function retryNoteEnrichmentAction(noteId: string) {
  const owner = await requireOwnerSession();
  const note = await retryNoteEnrichment(owner.id, noteId);

  if (!note) {
    notFound();
  }

  if (note.enrichment.status === "pending") {
    scheduleNoteEnrichment(note, note.enrichment.attempts);
  }

  revalidateNotePaths(note);
  redirect(`/app/notes/${noteId}/edit?retried=1`);
}
