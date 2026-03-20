import { createNoteAction } from "@/app/app/notes/actions";
import { NoteEditor } from "@/features/notes/components/note-editor";
import { requireOwnerSession } from "@/lib/auth/owner-session";

export default async function NewNotePage() {
  await requireOwnerSession();

  return (
    <NoteEditor
      action={createNoteAction}
      formDescription="Create a private draft note with a title and markdown body. Publishing remains a separate follow-on slice."
      formTitle="New draft note"
      initialMarkdown=""
      initialTitle=""
      submitLabel="Create draft"
    />
  );
}
