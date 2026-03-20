import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";

import { signOut } from "@/auth";
import { getEnrichmentStatusLabel } from "@/features/enrichment/types";
import { listOwnerNotes } from "@/features/notes/service";
import { requireOwnerSession } from "@/lib/auth/owner-session";

async function signOutAction() {
  "use server";

  await signOut({
    redirectTo: "/login"
  });
}

export default async function PrivateDashboardPage() {
  noStore();

  const owner = await requireOwnerSession();
  const notes = await listOwnerNotes(owner.id);
  const publishedNotes = notes.filter((note) => note.isPublished).length;
  const pendingNotes = notes.filter((note) => note.enrichment.status === "pending").length;

  return (
    <div className="feature-layout">
      <section className="hero-card">
        <p className="eyebrow">Private dashboard</p>
        <h1>{owner.name}&rsquo;s notes</h1>
        <p className="lede">
          Notes stay private by default. Create a new note, reopen existing drafts, and publish only the notes that
          should appear on the public homepage and note pages.
        </p>
        <div className="summary-row">
          <div>
            <strong>Total notes</strong>
            <span>{notes.length} in the vault</span>
          </div>
          <div>
            <strong>Published</strong>
            <span>{publishedNotes} public-facing note{publishedNotes === 1 ? "" : "s"}</span>
          </div>
          <div>
            <strong>AI queue</strong>
            <span>{pendingNotes === 0 ? "No pending note enrichment" : `${pendingNotes} note${pendingNotes === 1 ? "" : "s"} pending`}</span>
          </div>
        </div>
        <div className="button-row">
          <Link className="primary-button" href="/app/notes/new">
            New note
          </Link>
          <form action={signOutAction}>
            <button className="ghost-button" type="submit">
              Sign out
            </button>
          </form>
        </div>
      </section>

      <div className="dashboard-grid">
        <section className="panel-card">
          <div className="section-heading">
            <strong>Notes</strong>
            <span className="section-meta">Drafts and published notes</span>
          </div>
          {notes.length === 0 ? (
            <p>No drafts yet. Create the first note to start the private vault.</p>
          ) : (
            <div className="note-list">
              {notes.map((note) => (
                <article className="note-list-item" key={note.id}>
                  <div>
                    <div className="note-meta note-meta-leading">
                      <span>{note.isPublished ? "Published" : "Draft"}</span>
                      <span>{getEnrichmentStatusLabel(note.enrichment.status)}</span>
                    </div>
                    <Link className="note-list-link" href={`/app/notes/${note.id}/edit`}>
                      {note.title}
                    </Link>
                    <p>{note.excerpt || "Empty draft"}</p>
                    {note.summary ? <p className="note-generated-summary">AI summary: {note.summary}</p> : null}
                    <div className="tag-list" aria-label="Note tags">
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
                  <div className="note-meta">
                    <span>Updated</span>
                    <span>{new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(note.updatedAt)}</span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <aside className="panel-card dashboard-side-panel">
          <div className="section-heading">
            <strong>Workspace routes</strong>
            <span className="section-meta">Owner-only tools</span>
          </div>
          <div className="route-grid">
            <Link className="route-tile" href="/app/links">
              <strong>Reference shelf</strong>
              <span>Capture URLs and review generated summaries and tags.</span>
            </Link>
            <Link className="route-tile" href="/app/tags">
              <strong>Shared tags</strong>
              <span>Browse shared note and link metadata through one taxonomy.</span>
            </Link>
            <Link className="route-tile" href="/app/search">
              <strong>Vault search</strong>
              <span>Find private titles, URLs, and tags without exposing public search.</span>
            </Link>
          </div>
          <p className="field-note">
            Use tags to narrow private notes and links, and use search for title, URL, and tag retrieval inside the
            owner area.
          </p>
        </aside>
      </div>
    </div>
  );
}
