import Link from "next/link";

import { signOut } from "@/auth";
import { listOwnerNotes } from "@/features/notes/service";
import { requireOwnerSession } from "@/lib/auth/owner-session";

async function signOutAction() {
  "use server";

  await signOut({
    redirectTo: "/login"
  });
}

export default async function PrivateDashboardPage() {
  const owner = await requireOwnerSession();
  const notes = await listOwnerNotes(owner.id);

  return (
    <div className="feature-layout">
      <section className="feature-card">
        <p className="eyebrow">Private dashboard</p>
        <h1>{owner.name}&rsquo;s notes</h1>
        <p className="lede">
          Notes stay private by default. Create a new note, reopen existing drafts, and publish only the notes that
          should appear on the public homepage and note pages.
        </p>
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

      <section className="panel-card">
        <strong>Notes</strong>
        {notes.length === 0 ? (
          <p>No drafts yet. Create the first note to start the private vault.</p>
        ) : (
          <div className="note-list">
            {notes.map((note) => (
              <article className="note-list-item" key={note.id}>
                <div>
                  <Link className="note-list-link" href={`/app/notes/${note.id}/edit`}>
                    {note.title}
                  </Link>
                  <p>{note.excerpt || "Empty draft"}</p>
                </div>
                <div className="note-meta">
                  <span>{note.isPublished ? "Published" : "Draft"}</span>
                  <span>{new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(note.updatedAt)}</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="panel-card">
        <strong>Private routes</strong>
        <ul className="inline-list">
          <li>
            <Link href="/app/links">Links</Link>
          </li>
          <li>
            <Link href="/app/tags">Tags</Link>
          </li>
          <li>
            <Link href="/app/search">Search</Link>
          </li>
        </ul>
        <p>Links are live for private bookmark capture. Tags and search remain staged until their own task slices land.</p>
      </section>
    </div>
  );
}
