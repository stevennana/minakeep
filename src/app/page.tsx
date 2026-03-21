import Link from "next/link";

import { ButtonLink, DetailBlock, MetadataRow, SectionHeading, Surface, TagChip, TagList } from "@/components/ui/primitives";
import { listPublishedNotes } from "@/features/notes/service";

const publishedDateFormatter = new Intl.DateTimeFormat("en", { dateStyle: "medium" });

type PublishedNote = Awaited<ReturnType<typeof listPublishedNotes>>[number];
type NotePreviewVariant = "compact" | "balanced" | "feature";

function getNotePreviewVariant(note: PublishedNote): NotePreviewVariant {
  const hasSummary = Boolean(note.summary?.trim());
  const excerptLength = note.excerpt.trim().length;

  if (hasSummary && (excerptLength > 112 || note.tags.length >= 2)) {
    return "feature";
  }

  if (!hasSummary && excerptLength < 96 && note.tags.length <= 1) {
    return "compact";
  }

  return "balanced";
}

function PublishedNotePreviewCard({ note }: { note: PublishedNote }) {
  const variant = getNotePreviewVariant(note);
  const primaryPreview = note.summary?.trim() || note.excerpt.trim() || "Published note";
  const supportingPreview =
    variant === "feature" && note.summary?.trim() && note.excerpt.trim() !== note.summary.trim() ? note.excerpt.trim() : null;

  return (
    <article className={`note-preview-card note-preview-card-${variant}`} data-card-variant={variant}>
      <div className="note-preview-card-body">
        <h2 className="note-preview-card-title">
          <Link className="note-list-link" href={`/notes/${note.slug}`}>
            {note.title}
          </Link>
        </h2>
        <div className="note-preview-card-copy">
          <p className="note-preview-card-summary">{primaryPreview}</p>
          {supportingPreview ? <p className="note-preview-card-excerpt">{supportingPreview}</p> : null}
        </div>
      </div>
      <MetadataRow className="note-preview-card-meta">
        <span>Published note</span>
        <span>{publishedDateFormatter.format(note.publishedAt)}</span>
      </MetadataRow>
      <TagList aria-label="Published note tags" className="note-preview-card-tags">
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
    </article>
  );
}

export default async function HomePage() {
  const notes = await listPublishedNotes();
  const publishedCountLabel = `${notes.length} published note${notes.length === 1 ? "" : "s"}`;

  return (
    <div className="feature-layout public-home-layout">
      <div className="public-home-grid">
        <Surface className="note-collection-panel" tone="panel">
          <div className="public-home-shell-head">
            <div className="public-home-shell-copy">
              <p className="eyebrow">Public showroom</p>
              <p className="field-note">
                Published notes lead the public surface. Drafts, saved links, tags, and AI workflow stay inside the
                private studio.
              </p>
            </div>
            <div className="public-home-count" aria-label="Published note archive size">
              <span>Archive</span>
              <strong>{publishedCountLabel}</strong>
            </div>
          </div>
          <SectionHeading meta="Newest first" title="Published notes" />
          {notes.length === 0 ? (
            <p>No published notes yet. The public site stays empty until the owner explicitly publishes a note.</p>
          ) : (
            <div className="note-list public-note-list public-note-showroom" data-testid="public-home-showroom">
              {notes.map((note) => (
                <PublishedNotePreviewCard key={note.id} note={note} />
              ))}
            </div>
          )}
        </Surface>

        <div className="public-home-rail">
          <Surface className="public-hero public-intro-panel" tone="panel">
            <div className="hero-copy">
              <p className="eyebrow">Private origin</p>
              <h1>Notes the owner has chosen to share.</h1>
              <p className="lede">
                The public reading room only surfaces notes the owner has explicitly published. Everything else stays
                in the private vault until the owner promotes it.
              </p>
            </div>
          </Surface>

          <Surface as="aside" className="public-side-panel" tone="panel">
            <SectionHeading meta="Private workflow" title="Owner entrance" />
            <p className="field-note">
              Sign in to draft notes, capture links, review AI-generated summaries and tags, and decide what appears
              on public routes.
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
    </div>
  );
}
