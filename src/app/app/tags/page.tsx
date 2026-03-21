import Link from "next/link";

import { MetadataRow, SectionHeading, Surface, TagChip, TagList } from "@/components/ui/primitives";
import { EnrichmentPendingRefresh } from "@/features/enrichment/components/pending-refresh";
import { EnrichmentStatusBlock } from "@/features/enrichment/components/status-block";
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
      <Surface tone="hero">
        <p className="eyebrow">Shared tags</p>
        <h1>Filter the private vault by tag.</h1>
        <p className="lede">
          Shared tags stay owner-only in v1. Pick a tag to narrow private notes and saved links without exposing
          retrieval on the public site.
        </p>
        <div className="summary-row">
          <div>
            <strong>Tag library</strong>
            <span>{tags.length} shared tag{tags.length === 1 ? "" : "s"}</span>
          </div>
          <div>
            <strong>Selection</strong>
            <span>{selectedTag ?? "All private content"}</span>
          </div>
          <div>
            <strong>Public boundary</strong>
            <span>Tag exploration stays inside the owner area</span>
          </div>
        </div>
      </Surface>

      <Surface tone="panel">
        <SectionHeading meta="Shared across notes and links" title="Tag filters" />
        <div className="tag-filter-list" aria-label="Shared tag filters">
          <Link className={!selectedTag ? "tag-filter-link tag-filter-link-active" : "tag-filter-link"} href="/app/tags">
            All content
          </Link>
          {tags.length === 0 ? (
            <TagChip muted>No shared tags yet</TagChip>
          ) : (
            tags.map((tag) => (
              <Link
                className={selectedTag === tag.name ? "tag-filter-link tag-filter-link-active" : "tag-filter-link"}
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

      <div className="retrieval-grid">
        <Surface tone="panel">
          <SectionHeading
            meta="Markdown drafts and published notes"
            title={selectedTag ? `Notes tagged ${selectedTag}` : "Private notes"}
          />
          {filteredContent.notes.length === 0 ? (
            <p>{selectedTag ? "No private notes match this tag yet." : "No private notes yet."}</p>
          ) : (
            <div className="note-list">
              {filteredContent.notes.map((note) => (
                <article className="note-list-item" key={note.id}>
                  <div>
                    <MetadataRow leading>
                      <span>{note.isPublished ? "Published" : "Draft"}</span>
                      <span>{new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(note.updatedAt)}</span>
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
                </article>
              ))}
            </div>
          )}
        </Surface>

        <Surface tone="panel">
          <SectionHeading
            meta="Owner-only saved references"
            title={selectedTag ? `Links tagged ${selectedTag}` : "Private links"}
          />
          {filteredContent.links.length === 0 ? (
            <p>{selectedTag ? "No private links match this tag yet." : "No private links yet."}</p>
          ) : (
            <div className="link-list">
              {filteredContent.links.map((link) => (
                <article className="link-list-item" key={link.id}>
                  <div className="link-list-heading">
                    <MetadataRow leading>
                      <span>Private link</span>
                    </MetadataRow>
                    <a className="note-list-link" href={link.url} rel="noopener noreferrer" target="_blank">
                      {link.title}
                    </a>
                    <p className="link-url">{link.url}</p>
                  </div>
                  <EnrichmentStatusBlock state={link.enrichment} />
                  <div className="note-generated-copy">
                    <strong>AI summary</strong>
                    {link.summary ? (
                      <p className="link-summary">AI summary: {link.summary}</p>
                    ) : (
                      <p className="field-note">A generated summary will appear here after a successful enrichment run.</p>
                    )}
                  </div>
                  <div className="note-generated-copy">
                    <strong>AI tags</strong>
                    <TagList aria-label="Link tags">
                      {link.tags.length === 0 ? (
                        <TagChip muted>No generated tags yet</TagChip>
                      ) : (
                        link.tags.map((tag) => (
                          <TagChip key={tag.id}>
                            {tag.name}
                          </TagChip>
                        ))
                      )}
                    </TagList>
                  </div>
                  <div className="link-list-footer">
                    <MetadataRow>
                      <span>Updated</span>
                      <span>{new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(link.updatedAt)}</span>
                    </MetadataRow>
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
