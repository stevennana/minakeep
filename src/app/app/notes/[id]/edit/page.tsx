import { notFound } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";

import { deleteNoteAction, publishNoteAction, retryNoteEnrichmentAction, unpublishNoteAction, updateNoteAction } from "@/app/app/notes/actions";
import { Button, SectionHeading, Surface } from "@/components/ui/primitives";
import { NoteEditor } from "@/features/notes/components/note-editor";
import { getOwnerNoteForEditor } from "@/features/notes/service";
import { requireWorkspaceSession } from "@/lib/auth/owner-session";
import { isReadOnlyWorkspaceRole } from "@/lib/auth/roles";

type EditNotePageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<{
    error?: string;
    saved?: string;
    published?: string;
    retried?: string;
    unpublished?: string;
  }>;
};

export default async function EditNotePage({ params, searchParams }: EditNotePageProps) {
  noStore();

  const workspace = await requireWorkspaceSession();
  const isReadOnly = isReadOnlyWorkspaceRole(workspace.actor.role);
  const { id } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const note = await getOwnerNoteForEditor(workspace.owner.id, id);

  if (!note) {
    notFound();
  }

  return (
    <>
      <NoteEditor
        action={updateNoteAction.bind(null, note.id)}
        formDescription="Edit in markdown. Review and publish when ready."
        formTitle="Edit draft note"
        enrichment={note.enrichment}
        generatedSummary={note.summary}
        generatedTags={note.tags}
        initialMarkdown={note.markdown}
        initialTitle={note.title}
        noteId={note.id}
        readOnly={isReadOnly}
        publication={{
          isPublished: note.isPublished,
          publicHref: `/notes/${note.slug}`,
          publishAction: publishNoteAction.bind(null, note.id),
          unpublishAction: unpublishNoteAction.bind(null, note.id)
        }}
        retryAction={retryNoteEnrichmentAction.bind(null, note.id)}
        savedNotice={
          resolvedSearchParams.error === "delete-confirmation"
            ? "Confirm permanent delete before removing this note."
            : resolvedSearchParams.error === "delete-published"
              ? "Unpublish this note before deleting it permanently."
              : resolvedSearchParams.published === "1"
                ? "Note published."
                : resolvedSearchParams.unpublished === "1"
                  ? "Note unpublished."
                  : resolvedSearchParams.retried === "1"
                    ? "Retry requested."
                    : resolvedSearchParams.saved === "1"
                      ? "Draft saved."
                      : undefined
        }
        savedNoticeTone={resolvedSearchParams.error ? "error" : "default"}
        submitLabel="Save draft"
      />
      <Surface className="note-delete-panel" density="compact" tone="panel">
        <SectionHeading meta="Permanent removal" title="Delete draft" />
        {isReadOnly ? (
          <>
            <Button disabled type="button" variant="ghost">
              Delete unavailable
            </Button>
            <p className="field-note">Permanent delete stays disabled in the read-only demo workspace.</p>
          </>
        ) : note.isPublished ? (
          <>
            <Button disabled type="button" variant="ghost">
              Unpublish before deleting
            </Button>
            <p className="field-note">Delete becomes available only after this note is unpublished.</p>
          </>
        ) : (
          <details className="delete-disclosure">
            <summary className="ghost-button delete-disclosure-summary">Delete note</summary>
            <div className="delete-disclosure-panel">
              <p>This permanently removes this unpublished note. There is no trash or restore step.</p>
              <form action={deleteNoteAction.bind(null, note.id)} className="delete-confirmation-form">
                <input name="confirmDelete" type="hidden" value="permanent" />
                <div className="button-row delete-confirmation-actions">
                  <Button className="delete-action-button" type="submit">
                    Delete permanently
                  </Button>
                </div>
              </form>
            </div>
          </details>
        )}
      </Surface>
    </>
  );
}
