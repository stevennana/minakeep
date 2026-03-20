import Link from "next/link";

import { getEnrichmentStatusDetail, getEnrichmentStatusLabel } from "@/features/enrichment/types";
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

  return (
    <div className="feature-layout">
      <section className="feature-card">
        <p className="eyebrow">Shared tags</p>
        <h1>Filter the private vault by tag.</h1>
        <p className="lede">
          Shared tags stay owner-only in v1. Pick a tag to narrow private notes and saved links without exposing
          retrieval on the public site.
        </p>
      </section>

      <section className="panel-card">
        <strong>Tag filters</strong>
        <div className="tag-filter-list" aria-label="Shared tag filters">
          <Link className={!selectedTag ? "tag-filter-link tag-filter-link-active" : "tag-filter-link"} href="/app/tags">
            All content
          </Link>
          {tags.length === 0 ? (
            <span className="tag-pill tag-pill-muted">No shared tags yet</span>
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
      </section>

      <div className="retrieval-grid">
        <section className="panel-card">
          <strong>{selectedTag ? `Notes tagged ${selectedTag}` : "Private notes"}</strong>
          {filteredContent.notes.length === 0 ? (
            <p>{selectedTag ? "No private notes match this tag yet." : "No private notes yet."}</p>
          ) : (
            <div className="note-list">
              {filteredContent.notes.map((note) => (
                <article className="note-list-item" key={note.id}>
                  <div>
                    <Link className="note-list-link" href={`/app/notes/${note.id}/edit`}>
                      {note.title}
                    </Link>
                    <p>{note.excerpt || "Empty draft"}</p>
                    {note.summary ? <p className="note-generated-summary">AI summary: {note.summary}</p> : null}
                    <div className="tag-list" aria-label="Note tags">
                      {note.tags.length === 0 ? (
                        <span className="tag-pill tag-pill-muted">Untagged</span>
                      ) : (
                        note.tags.map((tag) => (
                          <span className="tag-pill" key={tag.id}>
                            {tag.name}
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                  <div className="note-meta">
                    <span>{note.isPublished ? "Published" : "Draft"}</span>
                    <span>{new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(note.updatedAt)}</span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="panel-card">
          <strong>{selectedTag ? `Links tagged ${selectedTag}` : "Private links"}</strong>
          {filteredContent.links.length === 0 ? (
            <p>{selectedTag ? "No private links match this tag yet." : "No private links yet."}</p>
          ) : (
            <div className="link-list">
              {filteredContent.links.map((link) => (
                <article className="link-list-item" key={link.id}>
                  <div className="link-list-heading">
                    <a className="note-list-link" href={link.url} rel="noopener noreferrer" target="_blank">
                      {link.title}
                    </a>
                    <p className="link-url">{link.url}</p>
                  </div>
                  {link.summary ? <p className="link-summary">AI summary: {link.summary}</p> : null}
                  <div className="link-list-footer">
                    <div className="tag-list" aria-label="Link tags">
                      {link.tags.length === 0 ? (
                        <span className="tag-pill tag-pill-muted">No generated tags yet</span>
                      ) : (
                        link.tags.map((tag) => (
                          <span className="tag-pill" key={tag.id}>
                            {tag.name}
                          </span>
                        ))
                      )}
                    </div>
                    <div className="note-meta">
                      <span>Private link</span>
                      <span>{getEnrichmentStatusLabel(link.enrichment.status)}</span>
                      <span>{new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(link.updatedAt)}</span>
                    </div>
                  </div>
                  {link.enrichment.status === "failed" ? <p className="field-note">{getEnrichmentStatusDetail(link.enrichment)}</p> : null}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
