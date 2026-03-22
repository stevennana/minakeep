"use server";

import { notFound, redirect } from "next/navigation";
import { createOwnerNote, queueNoteEnrichment, revalidateNotePaths, scheduleNoteEnrichment } from "@/features/notes/runtime";
import { publishNote, retryNoteEnrichment, unpublishNote, updateDraftNote } from "@/features/notes/service";
import { isReadOnlyWorkspaceMutationError, requireWritableOwnerSession } from "@/lib/auth/owner-session";

function getNoteInput(formData: FormData) {
  return {
    title: String(formData.get("title") ?? ""),
    markdown: String(formData.get("markdown") ?? "")
  };
}

function appendReadOnlyError(path: string) {
  return `${path}${path.includes("?") ? "&" : "?"}error=read-only`;
}

async function withWritableOwnerSession<T>(redirectPath: string, run: (owner: Awaited<ReturnType<typeof requireWritableOwnerSession>>) => Promise<T>) {
  try {
    const owner = await requireWritableOwnerSession();
    return await run(owner);
  } catch (error) {
    if (isReadOnlyWorkspaceMutationError(error)) {
      redirect(appendReadOnlyError(redirectPath) as Parameters<typeof redirect>[0]);
    }

    throw error;
  }
}

export async function createNoteAction(formData: FormData) {
  const note = await withWritableOwnerSession("/app", async (owner) => {
    return createOwnerNote(owner.id, getNoteInput(formData));
  });

  redirect(`/app/notes/${note.id}/edit?saved=1`);
}

export async function updateNoteAction(noteId: string, formData: FormData) {
  const note = await withWritableOwnerSession(`/app/notes/${noteId}/edit`, (owner) => updateDraftNote(owner.id, noteId, getNoteInput(formData)));

  if (!note) {
    notFound();
  }

  await queueNoteEnrichment(note);
  revalidateNotePaths(note);
  redirect(`/app/notes/${noteId}/edit?saved=1`);
}

export async function publishNoteAction(noteId: string) {
  const note = await withWritableOwnerSession(`/app/notes/${noteId}/edit`, (owner) => publishNote(owner.id, noteId));

  if (!note) {
    notFound();
  }

  revalidateNotePaths(note);
  redirect(`/app/notes/${noteId}/edit?published=1`);
}

export async function unpublishNoteAction(noteId: string) {
  const note = await withWritableOwnerSession(`/app/notes/${noteId}/edit`, (owner) => unpublishNote(owner.id, noteId));

  if (!note) {
    notFound();
  }

  revalidateNotePaths(note);
  redirect(`/app/notes/${noteId}/edit?unpublished=1`);
}

export async function retryNoteEnrichmentAction(noteId: string) {
  const note = await withWritableOwnerSession(`/app/notes/${noteId}/edit`, (owner) => retryNoteEnrichment(owner.id, noteId));

  if (!note) {
    notFound();
  }

  if (note.enrichment.status === "pending") {
    scheduleNoteEnrichment(note, note.enrichment.attempts);
  }

  revalidateNotePaths(note);
  redirect(`/app/notes/${noteId}/edit?retried=1`);
}
