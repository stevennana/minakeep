import type { Route } from "next";
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
            <span>All notes</span>
          </div>
          <div className="dashboard-stat">
            <span className="dashboard-stat-value">{publishedNotes}</span>
            <strong>Published</strong>
            <span>On the public site</span>
          </div>
          <div className="dashboard-stat">
            <span className="dashboard-stat-value">{pendingNotes}</span>
            <strong>AI queue</strong>
            <span>{pendingNotes === 0 ? "Clear" : `${pendingNotes} waiting`}</span>
          </div>
        </div>
      </Surface>

      <div className="dashboard-grid owner-dashboard-grid" data-testid="owner-dashboard-grid">
        <Surface className="owner-dashboard-main" tone="panel">
          <SectionHeading meta="Drafts and published notes" title="Notes" />
          {notes.length === 0 ? (
            <p>No notes yet. Create your first draft.</p>
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
      </div>
    </div>
  );
}
