import Link from "next/link";

import { getEnrichmentStatusDetail, getEnrichmentStatusLabel } from "@/features/enrichment/types";
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

  return (
    <div className="feature-layout">
      <section className="hero-card">
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
      </section>

      <form action="/app/search" className="panel-card search-form" role="search">
        <div className="section-heading">
          <strong>Search the private vault</strong>
          <span className="section-meta">Owner-only retrieval</span>
        </div>
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
          <button className="primary-button" type="submit">
            Search
          </button>
        </div>
      </form>

      {results.query ? (
        <div className="retrieval-grid">
          <section className="panel-card">
            <div className="section-heading">
              <strong>Matching notes</strong>
              <span className="section-meta">{results.notes.length} result{results.notes.length === 1 ? "" : "s"}</span>
            </div>
            {results.notes.length === 0 ? (
              <p>No private notes matched this query.</p>
            ) : (
              <div className="note-list">
                {results.notes.map((note) => (
                  <article className="note-list-item" key={note.id}>
                    <div>
                      <div className="note-meta note-meta-leading">
                        <span>{note.isPublished ? "Published" : "Draft"}</span>
                        <span>{new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(note.updatedAt)}</span>
                      </div>
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
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="panel-card">
            <div className="section-heading">
              <strong>Matching links</strong>
              <span className="section-meta">{results.links.length} result{results.links.length === 1 ? "" : "s"}</span>
            </div>
            {results.links.length === 0 ? (
              <p>No private links matched this query.</p>
            ) : (
              <div className="link-list">
                {results.links.map((link) => (
                  <article className="link-list-item" key={link.id}>
                    <div className="link-list-heading">
                      <div className="note-meta note-meta-leading">
                        <span>Private link</span>
                        <span>{getEnrichmentStatusLabel(link.enrichment.status)}</span>
                      </div>
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
                        <span>Updated</span>
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
      ) : (
        <section className="panel-card">
          <div className="section-heading">
            <strong>Search scope</strong>
            <span className="section-meta">v1 boundaries</span>
          </div>
          <p>Search matches note titles, link titles, link URLs, and shared tag names. Note bodies and link summaries stay out of scope in v1.</p>
        </section>
      )}
    </div>
  );
}
