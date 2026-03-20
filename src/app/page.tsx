import Link from "next/link";

import { listPublishedNotes } from "@/features/notes/service";

export default async function HomePage() {
  const notes = await listPublishedNotes();

  return (
    <div className="feature-layout">
      <section className="hero-card public-hero">
        <p className="eyebrow">Published notes</p>
        <h1>Notes the owner has chosen to share.</h1>
        <p className="lede">
          The public homepage stays limited to notes the owner has explicitly published. Drafts remain private inside
          the vault until they are promoted onto public routes.
        </p>
      </section>

      <section className="panel-card">
        <strong>Published notes</strong>
        {notes.length === 0 ? (
          <p>No published notes yet. The public site stays empty until the owner explicitly publishes a note.</p>
        ) : (
          <div className="note-list">
            {notes.map((note) => (
              <article className="note-list-item" key={note.id}>
                <div>
                  <Link className="note-list-link" href={`/notes/${note.slug}`}>
                    {note.title}
                  </Link>
                  <p>{note.excerpt || "Published note"}</p>
                </div>
                <div className="note-meta">
                  <span>Published</span>
                  <span>{new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(note.publishedAt)}</span>
                </div>
              </article>
            ))}
          </div>
        )}
        <div className="button-row">
          <Link className="primary-button" href="/login">
            Owner login
          </Link>
        </div>
      </section>
    </div>
  );
}
