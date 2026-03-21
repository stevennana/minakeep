import Link from "next/link";

import { ButtonLink, DetailBlock, MetadataRow, SectionHeading, Surface, TagChip, TagList } from "@/components/ui/primitives";
import { listPublishedContent } from "@/features/public-content/service";

const publishedDateFormatter = new Intl.DateTimeFormat("en", { dateStyle: "medium" });

type PublishedContent = Awaited<ReturnType<typeof listPublishedContent>>[number];
type ContentPreviewVariant = "compact" | "balanced" | "feature";

function getDisplayUrl(url: string) {
  try {
    const parsedUrl = new URL(url);
    const pathname = parsedUrl.pathname === "/" ? "" : parsedUrl.pathname;

    return `${parsedUrl.host}${pathname}`;
  } catch {
    return url.replace(/^https?:\/\//, "");
  }
}

function getContentPreviewVariant(item: PublishedContent): ContentPreviewVariant {
  if (item.kind === "note") {
    const hasSummary = Boolean(item.summary?.trim());
    const excerptLength = item.excerpt.trim().length;

    if (hasSummary && (excerptLength > 112 || item.tags.length >= 2)) {
      return "feature";
    }

    if (!hasSummary && excerptLength < 96 && item.tags.length <= 1) {
      return "compact";
    }

    return "balanced";
  }

  const hasSummary = Boolean(item.summary?.trim());
  const displayUrl = getDisplayUrl(item.url);

  if (hasSummary && (displayUrl.length > 32 || item.tags.length >= 2)) {
    return "feature";
  }

  if (!hasSummary && displayUrl.length < 32 && item.tags.length <= 1) {
    return "compact";
  }

  return "balanced";
}

function PublishedContentPreviewCard({ item }: { item: PublishedContent }) {
  const variant = getContentPreviewVariant(item);
  const isNote = item.kind === "note";
  const primaryPreview = isNote ? item.summary?.trim() || item.excerpt.trim() || "Published note" : item.summary?.trim() || "Published link";
  const supportingPreview =
    isNote && variant === "feature" && item.summary?.trim() && item.excerpt.trim() !== item.summary.trim()
      ? item.excerpt.trim()
      : null;

  return (
    <article
      className={`note-preview-card note-preview-card-${variant} public-content-card public-content-card-${item.kind}`}
      data-card-kind={item.kind}
      data-card-variant={variant}
    >
      <div className="note-preview-card-body">
        <h2 className="note-preview-card-title">
          {isNote ? (
            <Link className="note-list-link" href={`/notes/${item.slug}`}>
              {item.title}
            </Link>
          ) : (
            <a className="note-list-link" href={item.url} rel="noopener noreferrer" target="_blank">
              {item.title}
            </a>
          )}
        </h2>
        <div className="note-preview-card-copy">
          <p className="note-preview-card-summary">{primaryPreview}</p>
          {isNote ? (
            supportingPreview ? <p className="note-preview-card-excerpt">{supportingPreview}</p> : null
          ) : (
            <p className="note-preview-card-excerpt public-link-card-url">{getDisplayUrl(item.url)}</p>
          )}
        </div>
      </div>
      <MetadataRow className="note-preview-card-meta">
        <span>{isNote ? "Published note" : "Published link"}</span>
        <span>{publishedDateFormatter.format(item.publishedAt)}</span>
      </MetadataRow>
      <TagList aria-label={isNote ? "Published note tags" : "Published link tags"} className="note-preview-card-tags">
        {item.tags.length === 0 ? (
          <TagChip muted>No generated tags</TagChip>
        ) : (
          item.tags.map((tag) => (
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
  const items = await listPublishedContent();
  const publishedNotes = items.filter((item) => item.kind === "note").length;
  const publishedLinks = items.filter((item) => item.kind === "link").length;
  const hasPublishedLinks = publishedLinks > 0;
  const publishedCountLabel = hasPublishedLinks
    ? `${items.length} public item${items.length === 1 ? "" : "s"}`
    : `${publishedNotes} published note${publishedNotes === 1 ? "" : "s"}`;

  return (
    <div className="feature-layout public-home-layout">
      <div className="public-home-grid">
        <Surface className="note-collection-panel" tone="panel">
          <div className="public-home-shell-head">
            <div className="public-home-shell-copy">
              <p className="eyebrow">Public showroom</p>
              <p className="field-note">
                {hasPublishedLinks
                  ? "Published notes and published links lead the public surface. Drafts, private links, tags, and AI workflow stay inside the private studio."
                  : "Published notes lead the public surface. Drafts, saved links, tags, and AI workflow stay inside the private studio."}
              </p>
            </div>
            <div className="public-home-count" aria-label={hasPublishedLinks ? "Public archive size" : "Published note archive size"}>
              <span>Archive</span>
              <strong>{publishedCountLabel}</strong>
            </div>
          </div>
          <SectionHeading meta="Newest first" title={hasPublishedLinks ? "Published notes and links" : "Published notes"} />
          {items.length === 0 ? (
            <p>No published notes or links yet. The public site stays empty until the owner explicitly publishes one.</p>
          ) : (
            <div className="note-list public-note-list public-note-showroom" data-testid="public-home-showroom">
              {items.map((item) => (
                <PublishedContentPreviewCard key={`${item.kind}-${item.id}`} item={item} />
              ))}
            </div>
          )}
        </Surface>

        <div className="public-home-rail">
          <Surface className="public-hero public-intro-panel" tone="panel">
            <div className="hero-copy">
              <p className="eyebrow">Private origin</p>
              <h1>{hasPublishedLinks ? "Notes and links the owner has chosen to share." : "Notes the owner has chosen to share."}</h1>
              <p className="lede">
                {hasPublishedLinks
                  ? "The public reading room only surfaces notes and links the owner has explicitly published. Everything else stays in the private vault until the owner promotes it."
                  : "The public reading room only surfaces notes the owner has explicitly published. Everything else stays in the private vault until the owner promotes it."}
              </p>
            </div>
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
                <p>
                  {hasPublishedLinks
                    ? `${publishedNotes} published note${publishedNotes === 1 ? "" : "s"} and ${publishedLinks} published link${publishedLinks === 1 ? "" : "s"}.`
                    : "Published notes only. No anonymous search, no public link listings."}
                </p>
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
