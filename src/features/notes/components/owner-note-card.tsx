import Link from "next/link";

import { MetadataRow, TagChip, TagList } from "@/components/ui/primitives";
import { EnrichmentStatusBlock } from "@/features/enrichment/components/status-block";
import type { ImageLoadingIntent } from "@/features/media/loading-intent";
import { NoteCardImage } from "@/features/notes/components/note-card-image";
import type { NoteSummary } from "@/features/notes/types";

type OwnerNoteCardProps = {
  href: React.ComponentProps<typeof Link>["href"];
  loadingIntent?: ImageLoadingIntent;
  note: NoteSummary;
  secondary?: boolean;
  updatedAtLabel: string;
};

export function OwnerNoteCard({ href, loadingIntent = "lazy", note, secondary = false, updatedAtLabel }: OwnerNoteCardProps) {
  const itemClassName = secondary ? "note-list-item dashboard-note-item secondary-note-item" : "note-list-item dashboard-note-item";
  const linkClassName = secondary ? "note-list-link" : "note-list-link dashboard-note-link";
  const secondaryClassName = secondary ? "dashboard-note-secondary secondary-note-secondary" : "dashboard-note-secondary";
  const tagClassName = secondary ? "dashboard-note-tags secondary-note-tags" : "dashboard-note-tags";

  return (
    <article className={itemClassName}>
      <div className="dashboard-note-primary">
        {note.cardImage ? (
          <NoteCardImage
            frameClassName="note-card-image-frame dashboard-note-image-frame"
            image={note.cardImage}
            imageClassName="note-card-image dashboard-note-image"
            loadingIntent={loadingIntent}
            testId="owner-note-card-image"
            title={note.title}
          />
        ) : null}
        <MetadataRow className="dashboard-note-state" leading>
          <span>{note.isPublished ? "Published" : "Draft"}</span>
          <span>{updatedAtLabel}</span>
        </MetadataRow>
        <Link className={linkClassName} href={href}>
          {note.title}
        </Link>
        <p className="dashboard-note-excerpt">{note.excerpt || "Empty draft"}</p>
      </div>
      <div className={secondaryClassName}>
        <div className="dashboard-note-ai">
          <strong>AI summary:</strong>
          {note.summary ? (
            <p className="note-generated-summary dashboard-note-ai-summary">{note.summary}</p>
          ) : (
            <p className="field-note dashboard-note-ai-empty">Waiting for AI summary.</p>
          )}
        </div>
        <EnrichmentStatusBlock detailClassName="dashboard-note-ai-detail" state={note.enrichment} />
        <TagList aria-label="Note tags" className={tagClassName}>
          {note.tags.length === 0 ? (
            <TagChip muted>No generated tags</TagChip>
          ) : (
            note.tags.map((tag) => (
              <TagChip key={tag.id}>
                {tag.name}
              </TagChip>
            ))
          )}
        </TagList>
      </div>
    </article>
  );
}
