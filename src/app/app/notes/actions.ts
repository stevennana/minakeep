"use server";

import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { createDraftNote, updateDraftNote } from "@/features/notes/service";
import { requireOwnerSession } from "@/lib/auth/owner-session";

function getNoteInput(formData: FormData) {
  return {
    title: String(formData.get("title") ?? ""),
    markdown: String(formData.get("markdown") ?? "")
  };
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

  revalidatePath("/app");
  revalidatePath(`/app/notes/${noteId}/edit`);
  redirect(`/app/notes/${noteId}/edit?saved=1`);
}
