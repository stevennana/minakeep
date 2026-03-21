import type { Route } from "next";
import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";

import { signOut } from "@/auth";
import { Button, ButtonLink, SectionHeading, Surface } from "@/components/ui/primitives";
import { EnrichmentPendingRefresh } from "@/features/enrichment/components/pending-refresh";
import { OwnerNoteCard } from "@/features/notes/components/owner-note-card";
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
  const dateFormatter = new Intl.DateTimeFormat("en", { dateStyle: "medium" });

  return (
    <div className="feature-layout">
      <EnrichmentPendingRefresh enabled={notes.some((note) => note.enrichment.status === "pending")} />
      <Surface className="dashboard-hero" tone="hero">
        <div className="dashboard-hero-head">
          <div className="dashboard-hero-copy">
            <p className="eyebrow">Private dashboard</p>
            <h1 className="dashboard-hero-title">{owner.name}&rsquo;s notes</h1>
            <p className="lede dashboard-hero-lede">
              Reopen drafts quickly, keep published notes in rotation, and review generated metadata without turning
              the dashboard into a card wall.
            </p>
          </div>
          <div className="button-row dashboard-hero-actions">
            <ButtonLink href="/app/notes/new">New note</ButtonLink>
            <form action={signOutAction}>
              <Button type="submit" variant="ghost">
                Sign out
              </Button>
            </form>
          </div>
        </div>
        <div className="summary-row dashboard-summary-row" aria-label="Dashboard overview">
          <div className="dashboard-stat">
            <span className="dashboard-stat-value">{notes.length}</span>
            <strong>Total notes</strong>
            <span>Private and published notes combined</span>
          </div>
          <div className="dashboard-stat">
            <span className="dashboard-stat-value">{publishedNotes}</span>
            <strong>Published</strong>
            <span>Visible on public routes</span>
          </div>
          <div className="dashboard-stat">
            <span className="dashboard-stat-value">{pendingNotes}</span>
            <strong>AI queue</strong>
            <span>
              {pendingNotes === 0 ? "No note enrichment is waiting" : `${pendingNotes} note${pendingNotes === 1 ? "" : "s"} waiting`}
            </span>
          </div>
        </div>
      </Surface>

      <div className="dashboard-grid owner-dashboard-grid" data-testid="owner-dashboard-grid">
        <Surface className="owner-dashboard-main" tone="panel">
          <SectionHeading meta="Drafts and published notes" title="Notes" />
          {notes.length === 0 ? (
            <p>No drafts yet. Create the first note to start the private vault.</p>
          ) : (
            <div className="note-list owner-dashboard-note-list" data-testid="owner-dashboard-note-list">
              {notes.map((note) => (
                <OwnerNoteCard
                  href={`/app/notes/${note.id}/edit` as Route}
                  key={note.id}
                  note={note}
                  updatedAtLabel={dateFormatter.format(note.updatedAt)}
                />
              ))}
            </div>
          )}
        </Surface>

        <Surface as="aside" className="dashboard-side-panel owner-dashboard-side-panel" tone="panel">
          <SectionHeading meta="Owner-only tools" title="Workspace routes" />
          <div className="route-grid dashboard-route-grid">
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
