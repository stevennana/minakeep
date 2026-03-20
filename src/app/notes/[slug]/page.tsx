import Link from "next/link";
import { notFound } from "next/navigation";

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
      <article className="feature-card public-note-card">
        <div className="public-note-header">
          <div className="note-meta note-meta-leading">
            <span>Published note</span>
            <span>{new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(publishedAt)}</span>
          </div>
          <p className="eyebrow">Public reading</p>
          <h1>{note.title}</h1>
          <p className="lede public-note-lede">
            Authored markdown stays primary. Generated summary and tags remain visible as supporting metadata, not as a
            replacement for the note itself.
          </p>
          <div className="button-row">
            <Link className="ghost-button" href="/">
              Back to published notes
            </Link>
          </div>
        </div>
        {(note.summary || note.tags.length > 0) && (
          <section className="public-note-metadata">
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
              <div className="tag-list" aria-label="Published note tags">
                {note.tags.length === 0 ? (
                  <span className="tag-pill tag-pill-muted">No generated tags</span>
                ) : (
                  note.tags.map((tag) => (
                    <span className="tag-pill" key={tag.id}>
                      {tag.name}
                    </span>
                  ))
                )}
              </div>
            </div>
          </section>
        )}
        <div
          className="markdown-preview public-note-body"
          data-testid="public-note-markdown"
          dangerouslySetInnerHTML={{ __html: renderMarkdownToHtml(note.markdown) }}
        />
      </article>
    </div>
  );
}
