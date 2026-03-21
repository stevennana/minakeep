import Link from "next/link";

import { ButtonLink, DetailBlock, MetadataRow, SectionHeading, Surface, TagChip, TagList } from "@/components/ui/primitives";
import { listPublishedNotes } from "@/features/notes/service";

export default async function HomePage() {
  const notes = await listPublishedNotes();
  const publishedCountLabel = `${notes.length} published note${notes.length === 1 ? "" : "s"}`;

  return (
    <div className="feature-layout public-home-layout">
      <Surface className="public-hero" tone="hero">
        <div className="hero-copy">
          <p className="eyebrow">Published notes</p>
          <h1>Notes the owner has chosen to share.</h1>
          <p className="lede">
            The public reading room only surfaces notes the owner has explicitly published. Drafts, saved links, and
            working tags stay inside the private studio until they are intentionally promoted.
          </p>
        </div>
        <div className="summary-row">
          <div>
            <strong>Archive</strong>
            <span>{publishedCountLabel}</span>
          </div>
          <div>
            <strong>Writing model</strong>
            <span>Markdown-first notes with secondary AI metadata</span>
          </div>
          <div>
            <strong>Owner workflow</strong>
            <span>Draft privately, publish selectively, keep links private</span>
          </div>
        </div>
      </Surface>

      <div className="public-home-grid">
        <Surface className="note-collection-panel" tone="panel">
          <SectionHeading meta="Newest first" title="Published notes" />
          {notes.length === 0 ? (
            <p>No published notes yet. The public site stays empty until the owner explicitly publishes a note.</p>
          ) : (
            <div className="note-list">
              {notes.map((note) => (
                <article className="note-list-item note-list-item-public" key={note.id}>
                  <div>
                    <MetadataRow leading>
                      <span>Published note</span>
                      <span>{new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(note.publishedAt)}</span>
                    </MetadataRow>
                    <Link className="note-list-link" href={`/notes/${note.slug}`}>
                      {note.title}
                    </Link>
                    <p>{note.summary || note.excerpt || "Published note"}</p>
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
                </article>
              ))}
            </div>
          )}
        </Surface>

        <Surface as="aside" className="public-side-panel" tone="panel">
          <SectionHeading meta="Private workflow" title="Owner entrance" />
          <p className="field-note">
            Sign in to draft notes, capture links, review AI-generated summaries and tags, and decide what appears on
            public routes.
          </p>
          <div className="button-row">
            <ButtonLink href="/login">Owner login</ButtonLink>
          </div>
          <div className="detail-stack">
            <DetailBlock title="Public side">
              <p>Published notes only. No anonymous search, no public link listings.</p>
            </DetailBlock>
            <DetailBlock title="Private side">
              <p>Notes, links, tags, and search stay aligned in one shared knowledge-studio system.</p>
            </DetailBlock>
          </div>
        </Surface>
      </div>
    </div>
  );
}
