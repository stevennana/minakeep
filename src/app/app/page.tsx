import type { Route } from "next";
import { unstable_noStore as noStore } from "next/cache";

import { signOut } from "@/auth";
import { AutoLoadMore } from "@/components/ui/auto-load-more";
import { Button, ButtonLink, SectionHeading, Surface } from "@/components/ui/primitives";
import { EnrichmentPendingRefresh } from "@/features/enrichment/components/pending-refresh";
import { OwnerNoteCard } from "@/features/notes/components/owner-note-card";
import {
  countOwnerNotes,
  countPendingOwnerNotes,
  countPublishedOwnerNotes,
  listOwnerNotesPage
} from "@/features/notes/service";
import { normalizeIncrementalLimit, OWNER_COLLECTION_PAGE_SIZE } from "@/lib/pagination";
import { requireWorkspaceSession } from "@/lib/auth/owner-session";
import { isReadOnlyWorkspaceRole } from "@/lib/auth/roles";

async function signOutAction() {
  "use server";

  await signOut({
    redirectTo: "/login"
  });
}

type PrivateDashboardPageProps = {
  searchParams?: Promise<{
    deleted?: string;
    limit?: string;
  }>;
};

export default async function PrivateDashboardPage({ searchParams }: PrivateDashboardPageProps) {
  noStore();

  const workspace = await requireWorkspaceSession();
  const isReadOnly = isReadOnlyWorkspaceRole(workspace.actor.role);
  const resolvedSearchParams = (await searchParams) ?? {};
  const limit = normalizeIncrementalLimit(resolvedSearchParams.limit, OWNER_COLLECTION_PAGE_SIZE);
  const [notes, totalNotes, publishedNotes, pendingNotes] = await Promise.all([
    listOwnerNotesPage(workspace.owner.id, limit),
    countOwnerNotes(workspace.owner.id),
    countPublishedOwnerNotes(workspace.owner.id),
    countPendingOwnerNotes(workspace.owner.id)
  ]);
  const dateFormatter = new Intl.DateTimeFormat("en", { dateStyle: "medium" });
  const noteCards = notes.reduce<Array<{ loadingIntent: "lazy" | "prioritized"; note: (typeof notes)[number] }>>((cards, note) => {
    const prioritizedCount = cards.filter((card) => card.loadingIntent === "prioritized").length;

    cards.push({
      loadingIntent: note.cardImage && prioritizedCount < 1 ? "prioritized" : "lazy",
      note
    });

    return cards;
  }, []);

  return (
    <div className="feature-layout">
      <EnrichmentPendingRefresh enabled={pendingNotes > 0} />
      <Surface className="dashboard-hero" tone="hero">
        <div className="dashboard-hero-head">
          <div className="dashboard-hero-copy">
            <p className="eyebrow">{isReadOnly ? "Read-only demo" : "Private dashboard"}</p>
            <h1 className="dashboard-hero-title">{workspace.owner.name}&rsquo;s notes</h1>
          </div>
          <div className="button-row dashboard-hero-actions">
            {isReadOnly ? (
              <Button disabled type="button">
                New note unavailable
              </Button>
            ) : (
              <ButtonLink href="/app/notes/new">New note</ButtonLink>
            )}
            <form action={signOutAction}>
              <Button type="submit" variant="ghost">
                Sign out
              </Button>
            </form>
          </div>
        </div>
        {isReadOnly ? <p className="read-only-note">This demo shows the owner&rsquo;s real notes and publication state without allowing edits.</p> : null}
        {resolvedSearchParams.deleted === "note" ? <p className="status-note">Note permanently deleted.</p> : null}
        <div className="summary-row dashboard-summary-row" aria-label="Dashboard overview">
          <div className="dashboard-stat">
            <span className="dashboard-stat-value">{totalNotes}</span>
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
          <SectionHeading meta={notes.length < totalNotes ? `${notes.length} of ${totalNotes} loaded` : "Drafts and published notes"} title="Notes" />
          {totalNotes === 0 ? (
            <p>No notes yet. Create your first draft.</p>
          ) : (
            <>
              <div className="note-list owner-dashboard-note-list" data-testid="owner-dashboard-note-list">
                {noteCards.map(({ loadingIntent, note }) => {
                  return (
                    <OwnerNoteCard
                      href={`/app/notes/${note.id}/edit` as Route}
                      key={note.id}
                      loadingIntent={loadingIntent}
                      note={note}
                      updatedAtLabel={dateFormatter.format(note.updatedAt)}
                    />
                  );
                })}
              </div>
              <AutoLoadMore
                buttonLabel="Load more notes"
                currentCount={notes.length}
                currentLimit={limit}
                pageSize={OWNER_COLLECTION_PAGE_SIZE}
                testId="owner-notes-load-more"
                totalCount={totalNotes}
              />
            </>
          )}
        </Surface>
      </div>
    </div>
  );
}
