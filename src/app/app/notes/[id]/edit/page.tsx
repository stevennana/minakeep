import { notFound } from "next/navigation";

import { publishNoteAction, unpublishNoteAction, updateNoteAction } from "@/app/app/notes/actions";
import { NoteEditor } from "@/features/notes/components/note-editor";
import { getOwnerNoteForEditor } from "@/features/notes/service";
import { requireOwnerSession } from "@/lib/auth/owner-session";

type EditNotePageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<{
    saved?: string;
    published?: string;
    unpublished?: string;
  }>;
};

export default async function EditNotePage({ params, searchParams }: EditNotePageProps) {
  const owner = await requireOwnerSession();
  const { id } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const note = await getOwnerNoteForEditor(owner.id, id);

  if (!note) {
    notFound();
  }

  return (
    <NoteEditor
      action={updateNoteAction.bind(null, note.id)}
      formDescription="Edit the note, confirm the rendered output, and explicitly choose when it should appear on the public site."
      formTitle="Edit draft note"
      enrichment={note.enrichment}
      initialMarkdown={note.markdown}
      initialTags={note.tags.map((tag) => tag.name).join(", ")}
      initialTitle={note.title}
      publication={{
        isPublished: note.isPublished,
        publicHref: `/notes/${note.slug}`,
        publishAction: publishNoteAction.bind(null, note.id),
        unpublishAction: unpublishNoteAction.bind(null, note.id)
      }}
      savedNotice={
        resolvedSearchParams.published === "1"
          ? "Note published."
          : resolvedSearchParams.unpublished === "1"
            ? "Note unpublished."
            : resolvedSearchParams.saved === "1"
              ? "Draft saved."
              : undefined
      }
      submitLabel="Save draft"
    />
  );
}
