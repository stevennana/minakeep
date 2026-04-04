import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ButtonLink, MetadataRow, Surface, TagChip, TagList } from "@/components/ui/primitives";
import { renderMarkdownToHtml } from "@/features/notes/markdown";
import { getPublishedNoteBySlug } from "@/features/notes/service";
import { getPublicPageMetadata, getPublishedNotePath } from "@/features/public-site/metadata";

type PublicNotePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({ params }: PublicNotePageProps): Promise<Metadata> {
  const { slug } = await params;
  return getPublicPageMetadata(getPublishedNotePath(slug));
}

export default async function PublicNotePage({ params }: PublicNotePageProps) {
  const { slug } = await params;
  const note = await getPublishedNoteBySlug(slug);

  if (!note) {
    notFound();
  }

  const publishedAt = note.publishedAt ?? note.updatedAt;
  const formattedPublishedAt = new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(publishedAt);
  const hasSupportContent = Boolean(note.summary) || note.tags.length > 0;
  const renderedMarkdown = renderMarkdownToHtml(note.markdown);

  return (
    <div className="feature-layout public-note-layout">
      <Surface as="article" className="public-note-card" data-testid="public-note-card" tone="card">
        <header className="public-note-header">
          <div className="public-note-header-row public-note-utility-row">
            <ButtonLink className="public-note-back-link" href="/" variant="ghost">
              Back to published notes
            </ButtonLink>
            <MetadataRow leading className="public-note-meta">
              <span>Published note</span>
              <time dateTime={publishedAt.toISOString()}>{formattedPublishedAt}</time>
            </MetadataRow>
          </div>
          <div className="public-note-title-block">
            <p className="eyebrow">Public note</p>
            <h1>{note.title}</h1>
          </div>
          {hasSupportContent ? (
            <div className="public-note-support" data-testid="public-note-support">
              {note.summary ? (
                <div className="public-note-support-block" data-testid="public-note-summary">
                  <strong>AI summary</strong>
                  <p className="note-generated-summary">{note.summary}</p>
                </div>
              ) : null}
              {note.tags.length > 0 ? (
                <div className="public-note-support-block" data-testid="public-note-tags">
                  <strong>AI tags</strong>
                  <TagList aria-label="Published note tags" className="public-note-tags">
                    {note.tags.map((tag) => (
                      <TagChip className="public-note-tag" key={tag.id}>
                        {tag.name}
                      </TagChip>
                    ))}
                  </TagList>
                </div>
              ) : null}
            </div>
          ) : null}
        </header>
        <div
          className="markdown-preview public-note-body public-note-body--published"
          data-testid="public-note-markdown"
          dangerouslySetInnerHTML={{ __html: renderedMarkdown }}
        />
      </Surface>
    </div>
  );
}
