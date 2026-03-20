"use server";

import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { createDraftNote, publishNote, unpublishNote, updateDraftNote } from "@/features/notes/service";
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
  revalidatePath(`/app/notes/${note.id}/edit`);
  revalidatePath(`/notes/${note.slug}`);
}

export async function createNoteAction(formData: FormData) {
  const owner = await requireOwnerSession();
  const note = await createDraftNote(owner.id, getNoteInput(formData));

  revalidatePath("/app");
  redirect(`/app/notes/${note.id}/edit?saved=1`);
}

export async function updateNoteAction(noteId: string, formData: FormData) {
  const owner = await requireOwnerSession();
  const note = await updateDraftNote(owner.id, noteId, getNoteInput(formData));

  if (!note) {
    notFound();
  }

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
