"use client";

import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useDeferredValue, useEffect, useRef, useState, useTransition } from "react";

import { AutoLoadMore } from "@/components/ui/auto-load-more";
import { Button, MetadataRow, SectionHeading, Surface, TagChip, TagList } from "@/components/ui/primitives";
import type { ImageLoadingIntent } from "@/features/media/loading-intent";
import { PUBLIC_COLLECTION_PAGE_SIZE } from "@/lib/pagination";
import { LinkFavicon } from "@/features/links/components/link-favicon";
import { NoteCardImage } from "@/features/notes/components/note-card-image";
import type { NoteCardImage as NoteCardImageData } from "@/features/notes/types";

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
  cardImage: NoteCardImageData | null;
  excerpt: string;
  slug: string;
};

type ShowroomLinkItem = ShowroomBaseItem & {
  kind: "link";
  faviconAssetId: string | null;
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

function PublishedContentPreviewCard({ item, loadingIntent }: { item: PublicShowroomItem; loadingIntent: ImageLoadingIntent }) {
  const variant = getContentPreviewVariant(item);
  const isNote = item.kind === "note";
  const primaryPreview = isNote ? item.summary?.trim() || item.excerpt.trim() || "Published note" : item.summary?.trim() || "Published link";
  const supportingPreview =
    isNote && variant === "feature" && item.summary?.trim() && item.excerpt.trim() !== item.summary.trim()
      ? item.excerpt.trim()
      : null;

  if (isNote) {
    const noteHref = `/notes/${item.slug}` as Route;
    const noteTitleLinkId = `public-note-card-title-link-${item.id}`;
    const noteMediaLabelId = `public-note-card-media-label-${item.id}`;

    return (
      <article
        className={`note-preview-card note-preview-card-${variant} public-content-card public-content-card-${item.kind}`}
        data-card-kind={item.kind}
        data-card-variant={variant}
      >
        {item.cardImage ? (
          <Link
            aria-labelledby={`${noteTitleLinkId} ${noteMediaLabelId}`}
            className="note-preview-card-media-link"
            data-testid="public-note-card-media-link"
            href={noteHref}
          >
            <span className="sr-only" id={noteMediaLabelId}>
              Preview image.
            </span>
            <NoteCardImage
              frameClassName="note-card-image-frame note-preview-card-image-frame"
              image={item.cardImage}
              imageClassName="note-card-image note-preview-card-image"
              loadingIntent={loadingIntent}
              testId="public-note-card-image"
              title={item.title}
            />
          </Link>
        ) : null}
        <div className="note-preview-card-body">
          <h2 className="note-preview-card-title">
            <Link className="note-list-link" href={noteHref} id={noteTitleLinkId}>
              {item.title}
            </Link>
          </h2>
          <div className="note-preview-card-copy">
            <p className="note-preview-card-summary">{primaryPreview}</p>
            {supportingPreview ? <p className="note-preview-card-excerpt">{supportingPreview}</p> : null}
          </div>
        </div>
        <MetadataRow className="note-preview-card-meta public-card-meta">
          <span>Published note</span>
          <span>{item.publishedAtLabel}</span>
        </MetadataRow>
        <TagList aria-label="Published note tags" className="note-preview-card-tags">
          {item.tags.length === 0 ? (
            <TagChip className="public-card-tag" muted>
              No generated tags
            </TagChip>
          ) : (
            item.tags.map((tag) => (
              <TagChip className="public-card-tag" key={tag.id} title={tag.name}>
                {tag.name}
              </TagChip>
            ))
          )}
        </TagList>
      </article>
    );
  }

  const linkTitleLinkId = `public-link-card-title-link-${item.id}`;
  const linkDestinationLabelId = `public-link-card-destination-${item.id}`;
  const displayUrl = getDisplayUrl(item.url);

  return (
    <article
      className={`note-preview-card note-preview-card-${variant} public-content-card public-content-card-${item.kind}`}
      data-card-kind={item.kind}
      data-card-variant={variant}
    >
      <a
        aria-labelledby={`${linkTitleLinkId} ${linkDestinationLabelId}`}
        className="note-preview-card-media-link"
        data-testid="public-link-card-media-link"
        href={item.url}
        rel="noopener noreferrer"
        target="_blank"
      >
        <span className="sr-only" id={linkDestinationLabelId}>
          {`Destination ${displayUrl}. Opens externally in a new tab.`}
        </span>
        <LinkFavicon
          faviconAssetId={item.faviconAssetId}
          frameClassName="link-favicon-frame note-preview-card-image-frame link-preview-card-image-frame"
          imageClassName="link-favicon-image note-preview-card-image link-preview-card-image"
          loadingIntent={loadingIntent}
          testId="public-link-card-favicon"
        />
      </a>
      <div className="note-preview-card-body">
        <h2 className="note-preview-card-title">
          <a className="note-list-link" href={item.url} id={linkTitleLinkId} rel="noopener noreferrer" target="_blank">
            {item.title}
          </a>
        </h2>
        <div className="note-preview-card-copy">
          <p className="note-preview-card-summary">{primaryPreview}</p>
          <p className="note-preview-card-excerpt public-link-card-url">{displayUrl}</p>
        </div>
      </div>
      <MetadataRow className="note-preview-card-meta public-card-meta">
        <span>Published link</span>
        <span>Opens in new tab</span>
        <span>{item.publishedAtLabel}</span>
      </MetadataRow>
      <TagList aria-label="Published link tags" className="note-preview-card-tags">
        {item.tags.length === 0 ? (
          <TagChip className="public-card-tag" muted>
            No generated tags
          </TagChip>
        ) : (
          item.tags.map((tag) => (
            <TagChip className="public-card-tag" key={tag.id} title={tag.name}>
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

function getCollapsedSearchSummary(totalCount: number) {
  if (totalCount === 0) {
    return "No published titles yet.";
  }

  return `${totalCount} public item${totalCount === 1 ? "" : "s"}.`;
}

export function PublicShowroom({
  archiveCount,
  defaultSearchExpanded = false,
  hasPublishedLinks,
  initialLimit,
  items,
  matchingCount,
  query
}: {
  archiveCount: number;
  defaultSearchExpanded?: boolean;
  hasPublishedLinks: boolean;
  initialLimit: number;
  items: PublicShowroomItem[];
  matchingCount: number;
  query: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const [isSearchExpanded, setIsSearchExpanded] = useState(defaultSearchExpanded || query.length > 0);
  const [draftQuery, setDraftQuery] = useState(query);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const deferredQuery = useDeferredValue(draftQuery);
  const normalizedQuery = query.trim();
  const loadedCount = items.length;
  const searchPanelId = "public-title-search-panel";
  const publishedCountLabel = hasPublishedLinks
    ? `${archiveCount} public item${archiveCount === 1 ? "" : "s"}`
    : `${archiveCount} published note${archiveCount === 1 ? "" : "s"}`;
  const listTitle = hasPublishedLinks ? "Published notes and links" : "Published notes";
  const listMeta = normalizedQuery
    ? `${loadedCount}${loadedCount < matchingCount ? ` of ${matchingCount}` : ""} matching title${matchingCount === 1 ? "" : "s"}`
    : loadedCount < matchingCount
      ? `${loadedCount} of ${matchingCount} loaded`
      : "Newest first";
  const showroomHeading = hasPublishedLinks ? "Published notes and links" : "Published notes";
  const emptyStateMessage =
    archiveCount === 0
      ? "No published notes or links yet."
      : hasPublishedLinks
        ? "No published notes or links match this title."
        : "No published notes match this title.";
  const showroomCards = items.reduce<Array<{ item: PublicShowroomItem; loadingIntent: ImageLoadingIntent }>>((cards, item) => {
    const prioritizedCount = cards.filter((card) => card.loadingIntent === "prioritized").length;
    const hasMedia = item.kind === "link" || Boolean(item.cardImage);

    cards.push({
      item,
      loadingIntent: hasMedia && prioritizedCount < 2 ? "prioritized" : "lazy"
    });

    return cards;
  }, []);

  useEffect(() => {
    if (isSearchExpanded) {
      searchInputRef.current?.focus();
    }
  }, [isSearchExpanded]);

  useEffect(() => {
    const nextQuery = deferredQuery.trim();

    if (nextQuery === query) {
      return;
    }

    const nextSearchParams = new URLSearchParams(searchParams.toString());

    if (nextQuery) {
      nextSearchParams.set("q", nextQuery);
    } else {
      nextSearchParams.delete("q");
    }

    nextSearchParams.delete("limit");

    startTransition(() => {
      router.replace((nextSearchParams.size > 0 ? `${pathname}?${nextSearchParams.toString()}` : pathname) as Parameters<typeof router.replace>[0], {
        scroll: false
      });
    });
  }, [deferredQuery, pathname, query, router, searchParams]);

  const openSearch = () => setIsSearchExpanded(true);
  const closeSearch = () => {
    setDraftQuery("");
    setIsSearchExpanded(false);

    const nextSearchParams = new URLSearchParams(searchParams.toString());
    nextSearchParams.delete("q");
    nextSearchParams.delete("limit");

    startTransition(() => {
      router.replace((nextSearchParams.size > 0 ? `${pathname}?${nextSearchParams.toString()}` : pathname) as Parameters<typeof router.replace>[0], {
        scroll: false
      });
    });
  };

  return (
    <div className="public-home-grid">
      <Surface className="note-collection-panel public-home-archive" tone="panel">
        <div
          className="public-home-archive-head"
          data-search-expanded={isSearchExpanded ? "true" : "false"}
          data-testid="public-home-archive-head"
        >
          <div className="public-home-shell-head public-hero public-intro-panel" data-testid="public-home-shell-head">
            <div className="public-home-shell-copy">
              <p className="eyebrow">Public showroom</p>
              <h1>{showroomHeading}</h1>
            </div>
            <div className="public-home-count" aria-label={hasPublishedLinks ? "Public archive size" : "Published note archive size"}>
              <span>Archive</span>
              <strong>{publishedCountLabel}</strong>
            </div>
          </div>

          <div
            className="public-search-shell"
            data-search-expanded={isSearchExpanded ? "true" : "false"}
            data-testid="public-home-search-shell"
            role="search"
          >
            <div className={`search-form public-search-panel ${isSearchExpanded ? "public-search-panel-expanded" : "public-search-panel-collapsed"}`}>
              {isSearchExpanded ? (
                <div className="public-search-controls public-search-controls-expanded" id={searchPanelId}>
                  <div className="public-search-field">
                    <input
                      aria-label="Search public titles"
                      autoComplete="off"
                      className="text-input"
                      data-testid="public-home-search-input"
                      onChange={(event) => setDraftQuery(event.currentTarget.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Escape") {
                          event.preventDefault();
                          closeSearch();
                        }
                      }}
                      placeholder={hasPublishedLinks ? "Search public titles" : "Search published note titles"}
                      ref={searchInputRef}
                      type="search"
                      value={draftQuery}
                    />
                  </div>
                  <Button
                    aria-controls={searchPanelId}
                    aria-expanded={isSearchExpanded}
                    aria-label="Close public title search"
                    className="public-search-toggle"
                    data-testid="public-home-search-toggle"
                    onClick={closeSearch}
                    type="button"
                    variant="ghost"
                  >
                    Close
                  </Button>
                  <p className="field-note public-search-summary" data-testid="public-home-search-summary">
                    {getSearchSummary(normalizedQuery, loadedCount, matchingCount)}
                  </p>
                </div>
              ) : (
                <div className="public-search-collapsed-row">
                  <Button
                    aria-controls={searchPanelId}
                    aria-expanded={isSearchExpanded}
                    aria-label="Open public title search"
                    className="public-search-toggle"
                    data-testid="public-home-search-toggle"
                    onClick={openSearch}
                    type="button"
                    variant="ghost"
                  >
                    Search titles
                  </Button>
                  <p className="field-note public-search-summary" data-testid="public-home-search-summary">
                    {getCollapsedSearchSummary(archiveCount)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <SectionHeading className="public-showroom-section-heading" meta={listMeta} title={listTitle} />

        {items.length === 0 ? (
          <p data-testid="public-home-empty-state">{emptyStateMessage}</p>
        ) : (
          <>
            <div className="note-list public-note-list public-note-showroom" data-testid="public-home-showroom">
              {showroomCards.map(({ item, loadingIntent }) => {
                return <PublishedContentPreviewCard key={`${item.kind}-${item.id}`} item={item} loadingIntent={loadingIntent} />;
              })}
            </div>
            <AutoLoadMore
              buttonLabel="Load more published items"
              currentCount={loadedCount}
              currentLimit={initialLimit}
              pageSize={PUBLIC_COLLECTION_PAGE_SIZE}
              testId="public-home-load-more"
              totalCount={matchingCount}
            />
          </>
        )}
      </Surface>
    </div>
  );
}
