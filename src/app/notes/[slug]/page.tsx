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
        <div
          className="markdown-preview public-note-body"
          data-testid="public-note-markdown"
          dangerouslySetInnerHTML={{ __html: renderMarkdownToHtml(note.markdown) }}
        />
      </article>
    </div>
  );
}
