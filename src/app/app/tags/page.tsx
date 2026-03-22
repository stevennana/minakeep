import type { Route } from "next";
import Link from "next/link";

import { IntroBlock, MetadataRow, SectionHeading, Surface, TagChip, TagList } from "@/components/ui/primitives";
import { EnrichmentPendingRefresh } from "@/features/enrichment/components/pending-refresh";
import { EnrichmentStatusBlock } from "@/features/enrichment/components/status-block";
import { LinkFavicon } from "@/features/links/components/link-favicon";
import { OwnerNoteCard } from "@/features/notes/components/owner-note-card";
import { listOwnerTags, listOwnerContentByTag } from "@/features/tags/service";
import { normalizeSingleTagName } from "@/features/tags/normalize";
import { requireOwnerSession } from "@/lib/auth/owner-session";

type TagsPageProps = {
  searchParams?: Promise<{
    tag?: string;
  }>;
};

export default async function TagsPage({ searchParams }: TagsPageProps) {
  const owner = await requireOwnerSession();
  const resolvedSearchParams = (await searchParams) ?? {};
  const selectedTag = normalizeSingleTagName(resolvedSearchParams.tag);
  const dateFormatter = new Intl.DateTimeFormat("en", { dateStyle: "medium" });
  const [tags, filteredContent] = await Promise.all([
    listOwnerTags(owner.id),
    listOwnerContentByTag(owner.id, selectedTag)
  ]);
  const hasPendingResults =
    filteredContent.notes.some((note) => note.enrichment.status === "pending") ||
    filteredContent.links.some((link) => link.enrichment.status === "pending");

  return (
    <div className="feature-layout">
      <EnrichmentPendingRefresh enabled={hasPendingResults} />
      <Surface className="secondary-route-hero" density="compact" tone="hero">
        <IntroBlock
          compact
          description="Filter notes and links by tag."
          eyebrow="Shared tags"
          title="Browse one private taxonomy"
        >
          <MetadataRow aria-label="Tags overview" className="secondary-route-meta" leading>
            <span>{tags.length} tag{tags.length === 1 ? "" : "s"}</span>
            <span>{selectedTag ?? "All content"}</span>
            <span>Owner only</span>
          </MetadataRow>
        </IntroBlock>
      </Surface>

      <Surface className="secondary-filter-panel" density="compact" tone="panel">
        <SectionHeading meta="Shared across notes and links" title="Tag filters" />
        <div className="tag-filter-list secondary-tag-filters" aria-label="Shared tag filters">
          <Link
            className={!selectedTag ? "tag-filter-link tag-filter-link-active secondary-tag-filter" : "tag-filter-link secondary-tag-filter"}
            href="/app/tags"
          >
            All content
          </Link>
          {tags.length === 0 ? (
            <TagChip muted>No shared tags yet</TagChip>
          ) : (
            tags.map((tag) => (
              <Link
                className={
                  selectedTag === tag.name
                    ? "tag-filter-link tag-filter-link-active secondary-tag-filter"
                    : "tag-filter-link secondary-tag-filter"
                }
                href={`/app/tags?tag=${encodeURIComponent(tag.name)}`}
                key={tag.id}
              >
                {tag.name}
                <span className="tag-filter-count">
                  {tag.noteCount} note{tag.noteCount === 1 ? "" : "s"} / {tag.linkCount} link{tag.linkCount === 1 ? "" : "s"}
                </span>
              </Link>
            ))
          )}
        </div>
      </Surface>

      <div className="retrieval-grid secondary-retrieval-grid">
        <Surface className="secondary-list-panel secondary-note-panel" density="compact" tone="panel">
          <SectionHeading meta={`${filteredContent.notes.length} note${filteredContent.notes.length === 1 ? "" : "s"}`} title={selectedTag ? `Notes tagged ${selectedTag}` : "Private notes"} />
          {filteredContent.notes.length === 0 ? (
            <p>{selectedTag ? "No private notes match this tag yet." : "No private notes yet."}</p>
          ) : (
            <div className="note-list">
              {filteredContent.notes.map((note) => (
                <OwnerNoteCard
                  href={`/app/notes/${note.id}/edit` as Route}
                  key={note.id}
                  note={note}
                  secondary
                  updatedAtLabel={dateFormatter.format(note.updatedAt)}
                />
              ))}
            </div>
          )}
        </Surface>

        <Surface className="secondary-list-panel secondary-link-panel" density="compact" tone="panel">
          <SectionHeading meta={`${filteredContent.links.length} link${filteredContent.links.length === 1 ? "" : "s"}`} title={selectedTag ? `Links tagged ${selectedTag}` : "Private links"} />
          {filteredContent.links.length === 0 ? (
            <p>{selectedTag ? "No private links match this tag yet." : "No private links yet."}</p>
          ) : (
            <div className="link-list">
              {filteredContent.links.map((link) => (
                <article className="link-list-item secondary-link-item" key={link.id}>
                  <div className="secondary-link-main">
                    <div className="link-list-heading secondary-link-heading">
                      <LinkFavicon
                        faviconAssetId={link.faviconAssetId}
                        frameClassName="link-favicon-frame secondary-link-favicon-frame"
                        imageClassName="link-favicon-image secondary-link-favicon-image"
                      />
                      <div className="secondary-link-heading-copy">
                        <MetadataRow leading>
                          <span>Private link</span>
                          <span>{dateFormatter.format(link.updatedAt)}</span>
                        </MetadataRow>
                        <a className="note-list-link" href={link.url} rel="noopener noreferrer" target="_blank">
                          {link.title}
                        </a>
                        <p className="link-url">{link.url}</p>
                      </div>
                    </div>
                    <div className="link-list-footer secondary-link-footer">
                      <MetadataRow>
                        <span>Selection</span>
                        <span>{selectedTag ?? "All tags"}</span>
                      </MetadataRow>
                    </div>
                  </div>
                  <div className="secondary-link-meta">
                    <EnrichmentStatusBlock detailClassName="secondary-link-status" state={link.enrichment} />
                    <div className="note-generated-copy secondary-generated-copy">
                      <strong>AI summary:</strong>
                      {link.summary ? (
                        <p className="link-summary">{link.summary}</p>
                      ) : (
                        <p className="field-note">Waiting for AI summary.</p>
                      )}
                    </div>
                    <div className="note-generated-copy secondary-generated-copy">
                      <strong>AI tags</strong>
                      <TagList aria-label="Link tags">
                        {link.tags.length === 0 ? (
                          <TagChip muted>No AI tags yet</TagChip>
                        ) : (
                          link.tags.map((tag) => (
                            <TagChip key={tag.id}>
                              {tag.name}
                            </TagChip>
                          ))
                        )}
                      </TagList>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </Surface>
      </div>
    </div>
  );
}
