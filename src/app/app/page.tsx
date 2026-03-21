import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";

import { signOut } from "@/auth";
import { Button, ButtonLink, MetadataRow, SectionHeading, Surface, TagChip, TagList } from "@/components/ui/primitives";
import { EnrichmentPendingRefresh } from "@/features/enrichment/components/pending-refresh";
import { EnrichmentStatusBlock } from "@/features/enrichment/components/status-block";
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
      <EnrichmentPendingRefresh enabled={notes.some((note) => note.enrichment.status === "pending")} />
      <Surface tone="hero">
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
          <ButtonLink href="/app/notes/new">New note</ButtonLink>
          <form action={signOutAction}>
            <Button type="submit" variant="ghost">
              Sign out
            </Button>
          </form>
        </div>
      </Surface>

      <div className="dashboard-grid">
        <Surface tone="panel">
          <SectionHeading meta="Drafts and published notes" title="Notes" />
          {notes.length === 0 ? (
            <p>No drafts yet. Create the first note to start the private vault.</p>
          ) : (
            <div className="note-list">
              {notes.map((note) => (
                <article className="note-list-item" key={note.id}>
                  <div>
                    <MetadataRow leading>
                      <span>{note.isPublished ? "Published" : "Draft"}</span>
                    </MetadataRow>
                    <Link className="note-list-link" href={`/app/notes/${note.id}/edit`}>
                      {note.title}
                    </Link>
                    <p>{note.excerpt || "Empty draft"}</p>
                    {note.summary ? <p className="note-generated-summary">AI summary: {note.summary}</p> : null}
                    <EnrichmentStatusBlock state={note.enrichment} />
                    <TagList aria-label="Note tags">
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
                  <MetadataRow>
                    <span>Updated</span>
                    <span>{new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(note.updatedAt)}</span>
                  </MetadataRow>
                </article>
              ))}
            </div>
          )}
        </Surface>

        <Surface as="aside" className="dashboard-side-panel" tone="panel">
          <SectionHeading meta="Owner-only tools" title="Workspace routes" />
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
        </Surface>
      </div>
    </div>
  );
}
