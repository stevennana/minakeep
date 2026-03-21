"use client";

import Link from "next/link";
import { useState } from "react";

import { FormField, MetadataRow, SectionHeading, Surface, TagChip, TagList } from "@/components/ui/primitives";

type ShowroomTag = {
  id: string;
  name: string;
};

type ShowroomBaseItem = {
  id: string;
  kind: "note" | "link";
  title: string;
  summary: string | null;
  publishedAtLabel: string;
  tags: ShowroomTag[];
};

type ShowroomNoteItem = ShowroomBaseItem & {
  kind: "note";
  excerpt: string;
  slug: string;
};

type ShowroomLinkItem = ShowroomBaseItem & {
  kind: "link";
  url: string;
};

export type PublicShowroomItem = ShowroomNoteItem | ShowroomLinkItem;

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

function getContentPreviewVariant(item: PublicShowroomItem): ContentPreviewVariant {
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

function PublishedContentPreviewCard({ item }: { item: PublicShowroomItem }) {
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
        <span>{item.publishedAtLabel}</span>
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

function getSearchSummary(query: string, visibleCount: number, totalCount: number) {
  if (totalCount === 0) {
    return "No published titles yet.";
  }

  if (!query) {
    return `Showing all ${totalCount} public item${totalCount === 1 ? "" : "s"}.`;
  }

  if (visibleCount === 0) {
    return `No title matches "${query}".`;
  }

  return `Showing ${visibleCount} of ${totalCount} public item${totalCount === 1 ? "" : "s"}.`;
}

export function PublicShowroom({ hasPublishedLinks, items }: { hasPublishedLinks: boolean; items: PublicShowroomItem[] }) {
  const [query, setQuery] = useState("");
  const publishedNotes = items.filter((item) => item.kind === "note").length;
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const filteredItems = normalizedQuery.length === 0 ? items : items.filter((item) => item.title.toLocaleLowerCase().includes(normalizedQuery));
  const publishedCountLabel = hasPublishedLinks
    ? `${items.length} public item${items.length === 1 ? "" : "s"}`
    : `${publishedNotes} published note${publishedNotes === 1 ? "" : "s"}`;
  const listTitle = hasPublishedLinks ? "Published notes and links" : "Published notes";
  const listMeta = normalizedQuery ? `${filteredItems.length} matching title${filteredItems.length === 1 ? "" : "s"}` : "Newest first";
  const emptyStateMessage =
    items.length === 0
      ? "No published notes or links yet. The public site stays empty until the owner explicitly publishes one."
      : hasPublishedLinks
        ? "No published notes or links match this title."
        : "No published notes match this title.";

  return (
    <>
      <Surface className="public-search-shell" density="compact" role="search" tone="panel">
        <div className="search-form public-search-panel">
          <SectionHeading meta="Title-only live filter" title="Search public titles" />
          <div className="public-search-controls">
            <FormField
              className="public-search-field"
              hint="Matches published note and link titles only."
              label="Title filter"
            >
              <input
                aria-label="Search public titles"
                autoComplete="off"
                className="text-input"
                data-testid="public-home-search-input"
                onChange={(event) => setQuery(event.currentTarget.value)}
                placeholder={hasPublishedLinks ? "Filter published notes and links by title" : "Filter published notes by title"}
                type="search"
                value={query}
              />
            </FormField>
            <p className="field-note public-search-summary" data-testid="public-home-search-summary">
              {getSearchSummary(query.trim(), filteredItems.length, items.length)}
            </p>
          </div>
        </div>
      </Surface>

      <div className="public-home-grid">
        <Surface className="note-collection-panel" tone="panel">
          <div className="public-home-shell-head public-hero public-intro-panel">
            <div className="public-home-shell-copy">
              <p className="eyebrow">Public showroom</p>
              <h1>{hasPublishedLinks ? "Notes and links the owner has chosen to share." : "Notes the owner has chosen to share."}</h1>
              <p className="field-note lede">
                {hasPublishedLinks
                  ? "Published notes and published links lead the public surface. Drafts, private links, tags, and AI workflow stay inside the private studio until the owner chooses to publish them."
                  : "Published notes lead the public surface. Drafts, saved links, tags, and AI workflow stay inside the private studio until the owner chooses to publish them."}
              </p>
            </div>
            <div className="public-home-count" aria-label={hasPublishedLinks ? "Public archive size" : "Published note archive size"}>
              <span>Archive</span>
              <strong>{publishedCountLabel}</strong>
            </div>
          </div>
          <SectionHeading meta={listMeta} title={listTitle} />
          {filteredItems.length === 0 ? (
            <p data-testid="public-home-empty-state">{emptyStateMessage}</p>
          ) : (
            <div className="note-list public-note-list public-note-showroom" data-testid="public-home-showroom">
              {filteredItems.map((item) => (
                <PublishedContentPreviewCard key={`${item.kind}-${item.id}`} item={item} />
              ))}
            </div>
          )}
        </Surface>
      </div>
    </>
  );
}
