import Link from "next/link";

import { Button, MetadataRow, SectionHeading, Surface, TagChip, TagList } from "@/components/ui/primitives";
import { EnrichmentPendingRefresh } from "@/features/enrichment/components/pending-refresh";
import { EnrichmentStatusBlock } from "@/features/enrichment/components/status-block";
import { searchOwnerContent } from "@/features/search/service";
import { requireOwnerSession } from "@/lib/auth/owner-session";

type SearchPageProps = {
  searchParams?: Promise<{
    q?: string;
  }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const owner = await requireOwnerSession();
  const resolvedSearchParams = (await searchParams) ?? {};
  const results = await searchOwnerContent(owner.id, resolvedSearchParams.q);
  const resultCount = results.notes.length + results.links.length;
  const hasPendingResults =
    results.notes.some((note) => note.enrichment.status === "pending") ||
    results.links.some((link) => link.enrichment.status === "pending");

  return (
    <div className="feature-layout">
      <EnrichmentPendingRefresh enabled={hasPendingResults} />
      <Surface tone="hero">
        <p className="eyebrow">Owner search</p>
        <h1>Search private titles, URLs, and tags.</h1>
        <p className="lede">
          This search stays inside the owner area. Public readers do not get a search interface in v1.
        </p>
        <div className="summary-row">
          <div>
            <strong>Scope</strong>
            <span>Titles, URLs, and shared tag names</span>
          </div>
          <div>
            <strong>Body search</strong>
            <span>Note bodies and link summaries stay out of scope in v1</span>
          </div>
          <div>
            <strong>Current results</strong>
            <span>{results.query ? `${resultCount} match${resultCount === 1 ? "" : "es"}` : "Run a query to inspect the vault"}</span>
          </div>
        </div>
      </Surface>

      <Surface action="/app/search" as="form" className="search-form" role="search" tone="panel">
        <SectionHeading meta="Owner-only retrieval" title="Search the private vault" />
        <label className="field-group">
          <span>Query</span>
          <input
            autoComplete="off"
            className="text-input"
            defaultValue={results.query}
            name="q"
            placeholder="Search note titles, link titles, URLs, or tags"
            type="search"
          />
        </label>
        <div className="button-row">
          <Button type="submit">Search</Button>
        </div>
      </Surface>

      {results.query ? (
        <div className="retrieval-grid">
          <Surface tone="panel">
            <SectionHeading meta={`${results.notes.length} result${results.notes.length === 1 ? "" : "s"}`} title="Matching notes" />
            {results.notes.length === 0 ? (
              <p>No private notes matched this query.</p>
            ) : (
              <div className="note-list">
                {results.notes.map((note) => (
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
            <SectionHeading meta={`${results.links.length} result${results.links.length === 1 ? "" : "s"}`} title="Matching links" />
            {results.links.length === 0 ? (
              <p>No private links matched this query.</p>
            ) : (
              <div className="link-list">
                {results.links.map((link) => (
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
      ) : (
        <Surface tone="panel">
          <SectionHeading meta="v1 boundaries" title="Search scope" />
          <p>Search matches note titles, link titles, link URLs, and shared tag names. Note bodies and link summaries stay out of scope in v1.</p>
        </Surface>
      )}
    </div>
  );
}
