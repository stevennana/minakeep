import { notFound } from "next/navigation";

import { ButtonLink, MetadataRow, Surface, TagChip, TagList } from "@/components/ui/primitives";
import { renderMarkdownToHtml } from "@/features/notes/markdown";
import { getPublishedNoteBySlug } from "@/features/notes/service";

type PublicNotePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function PublicNotePage({ params }: PublicNotePageProps) {
  const { slug } = await params;
  const note = await getPublishedNoteBySlug(slug);

  if (!note) {
    notFound();
  }

  const publishedAt = note.publishedAt ?? note.updatedAt;

  return (
    <div className="feature-layout public-note-layout">
      <Surface as="article" className="public-note-card" tone="card">
        <div className="public-note-header">
          <MetadataRow leading>
            <span>Published note</span>
            <span>{new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(publishedAt)}</span>
          </MetadataRow>
          <p className="eyebrow">Public reading</p>
          <h1>{note.title}</h1>
          <p className="lede public-note-lede">
            Authored markdown stays primary. Generated summary and tags remain visible as supporting metadata, not as a
            replacement for the note itself.
          </p>
          <div className="button-row">
            <ButtonLink href="/" variant="ghost">
              Back to published notes
            </ButtonLink>
          </div>
        </div>
        {(note.summary || note.tags.length > 0) && (
          <Surface tone="inset">
            <div className="note-generated-copy">
              <strong>AI summary</strong>
              {note.summary ? (
                <p className="note-generated-summary">{note.summary}</p>
              ) : (
                <p className="field-note">No generated summary is available for this published note.</p>
              )}
            </div>
            <div className="note-generated-copy">
              <strong>AI tags</strong>
              <TagList aria-label="Published note tags">
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
          </Surface>
        )}
        <div
          className="markdown-preview public-note-body"
          data-testid="public-note-markdown"
          dangerouslySetInnerHTML={{ __html: renderMarkdownToHtml(note.markdown) }}
        />
      </Surface>
    </div>
  );
}
