import { unstable_noStore as noStore } from "next/cache";

import { createNoteAction } from "@/app/app/notes/actions";
import { NoteEditor } from "@/features/notes/components/note-editor";
import { requireWorkspaceSession } from "@/lib/auth/owner-session";
import { isReadOnlyWorkspaceRole } from "@/lib/auth/roles";

export default async function NewNotePage() {
  noStore();

  const workspace = await requireWorkspaceSession();
  const isReadOnly = isReadOnlyWorkspaceRole(workspace.actor.role);

  return (
    <NoteEditor
      action={createNoteAction}
      formDescription="Start in markdown. Publish when ready."
      formTitle="New draft note"
      initialMarkdown=""
      initialTitle=""
      readOnly={isReadOnly}
      submitLabel="Create draft"
    />
  );
}
