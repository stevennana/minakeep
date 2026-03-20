import Link from "next/link";

import { listPublishedNotes } from "@/features/notes/service";

export default async function HomePage() {
  const notes = await listPublishedNotes();
  const publishedCountLabel = `${notes.length} published note${notes.length === 1 ? "" : "s"}`;

  return (
    <div className="feature-layout public-home-layout">
      <section className="hero-card public-hero">
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
      </section>

      <div className="public-home-grid">
        <section className="panel-card note-collection-panel">
          <div className="section-heading">
            <strong>Published notes</strong>
            <span className="section-meta">Newest first</span>
          </div>
          {notes.length === 0 ? (
            <p>No published notes yet. The public site stays empty until the owner explicitly publishes a note.</p>
          ) : (
            <div className="note-list">
              {notes.map((note) => (
                <article className="note-list-item note-list-item-public" key={note.id}>
                  <div>
                    <div className="note-meta note-meta-leading">
                      <span>Published note</span>
                      <span>{new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(note.publishedAt)}</span>
                    </div>
                    <Link className="note-list-link" href={`/notes/${note.slug}`}>
                      {note.title}
                    </Link>
                    <p>{note.summary || note.excerpt || "Published note"}</p>
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
                </article>
              ))}
            </div>
          )}
        </section>

        <aside className="panel-card public-side-panel">
          <div className="section-heading">
            <strong>Owner entrance</strong>
            <span className="section-meta">Private workflow</span>
          </div>
          <p className="field-note">
            Sign in to draft notes, capture links, review AI-generated summaries and tags, and decide what appears on
            public routes.
          </p>
          <div className="button-row">
            <Link className="primary-button" href="/login">
              Owner login
            </Link>
          </div>
          <div className="detail-stack">
            <div className="detail-block">
              <strong>Public side</strong>
              <p>Published notes only. No anonymous search, no public link listings.</p>
            </div>
            <div className="detail-block">
              <strong>Private side</strong>
              <p>Notes, links, tags, and search stay aligned in one shared knowledge-studio system.</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
