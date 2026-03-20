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
    <div className="feature-layout">
      <article className="feature-card public-note-card">
        <p className="eyebrow">Published note</p>
        <h1>{note.title}</h1>
        <div className="note-meta">
          <span>Public</span>
          <span>{new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(publishedAt)}</span>
        </div>
        {note.summary ? <p className="note-generated-summary">AI summary: {note.summary}</p> : null}
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
        <div
          className="markdown-preview public-note-body"
          data-testid="public-note-markdown"
          dangerouslySetInnerHTML={{ __html: renderMarkdownToHtml(note.markdown) }}
        />
      </article>
    </div>
  );
}
