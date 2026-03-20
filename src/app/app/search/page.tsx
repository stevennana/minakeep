import Link from "next/link";

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

  return (
    <div className="feature-layout">
      <section className="feature-card">
        <p className="eyebrow">Owner search</p>
        <h1>Search private titles, URLs, and tags.</h1>
        <p className="lede">
          This search stays inside the owner area. Public readers do not get a search interface in v1.
        </p>
      </section>

      <form action="/app/search" className="panel-card search-form" role="search">
        <strong>Search the private vault</strong>
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
            <strong>Matching notes</strong>
            {results.notes.length === 0 ? (
              <p>No private notes matched this query.</p>
            ) : (
              <div className="note-list">
                {results.notes.map((note) => (
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
            <strong>Matching links</strong>
            {results.links.length === 0 ? (
              <p>No private links matched this query.</p>
            ) : (
              <div className="link-list">
                {results.links.map((link) => (
                  <article className="link-list-item" key={link.id}>
                    <div className="link-list-heading">
                      <a className="note-list-link" href={link.url} rel="noopener noreferrer" target="_blank">
                        {link.title}
                      </a>
                      <p className="link-url">{link.url}</p>
                    </div>
                    <p className="link-summary">{link.summary}</p>
                    <div className="link-list-footer">
                      <div className="tag-list" aria-label="Link tags">
                        {link.tags.length === 0 ? (
                          <span className="tag-pill tag-pill-muted">Untagged</span>
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
                        <span>{new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(link.updatedAt)}</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      ) : (
        <section className="panel-card">
          <strong>Search scope</strong>
          <p>Search matches note titles, link titles, link URLs, and shared tag names. Note bodies and link summaries stay out of scope in v1.</p>
        </section>
      )}
    </div>
  );
}
