import type { Route } from "next";
import Link from "next/link";

import {
  Button,
  DetailBlock,
  FormField,
  IntroBlock,
  MetadataRow,
  SectionHeading,
  Surface,
  TagChip,
  TagList
} from "@/components/ui/primitives";
import { EnrichmentPendingRefresh } from "@/features/enrichment/components/pending-refresh";
import { EnrichmentStatusBlock } from "@/features/enrichment/components/status-block";
import { LinkFavicon } from "@/features/links/components/link-favicon";
import { OwnerNoteCard } from "@/features/notes/components/owner-note-card";
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
  const dateFormatter = new Intl.DateTimeFormat("en", { dateStyle: "medium" });
  const hasPendingResults =
    results.notes.some((note) => note.enrichment.status === "pending") ||
    results.links.some((link) => link.enrichment.status === "pending");

  return (
    <div className="feature-layout">
      <EnrichmentPendingRefresh enabled={hasPendingResults} />
      <Surface className="secondary-route-hero" density="compact" tone="hero">
        <IntroBlock
          compact
          description="This search stays inside the owner area. Public readers do not get a search interface in v1."
          eyebrow="Owner search"
          title="Search the private vault"
        >
          <div aria-label="Search overview" className="ui-support-grid secondary-summary-grid">
            <DetailBlock title="Scope">
              <p>Titles, URLs, and shared tag names.</p>
            </DetailBlock>
            <DetailBlock title="Body search">
              <p>Note bodies and link summaries stay out of scope in v1.</p>
            </DetailBlock>
            <DetailBlock title="Current results">
              <p>{results.query ? `${resultCount} match${resultCount === 1 ? "" : "es"}` : "Run a query to inspect the vault."}</p>
            </DetailBlock>
          </div>
        </IntroBlock>
      </Surface>

      <Surface
        action="/app/search"
        as="form"
        className="search-form secondary-search-form"
        density="compact"
        role="search"
        tone="panel"
      >
        <SectionHeading meta="Owner-only retrieval" title="Query" />
        <div className="secondary-search-controls">
          <FormField className="secondary-search-field" label="Query">
            <input
              autoComplete="off"
              className="text-input"
              defaultValue={results.query}
              name="q"
              placeholder="Search note titles, link titles, URLs, or tags"
              type="search"
            />
          </FormField>
          <div className="button-row secondary-search-actions">
            <Button type="submit">Search</Button>
          </div>
        </div>
      </Surface>

      {results.query ? (
        <div className="retrieval-grid secondary-retrieval-grid">
          <Surface className="secondary-list-panel secondary-note-panel" density="compact" tone="panel">
            <SectionHeading meta={`${results.notes.length} result${results.notes.length === 1 ? "" : "s"}`} title="Matching notes" />
            {results.notes.length === 0 ? (
              <p>No private notes matched this query.</p>
            ) : (
              <div className="note-list">
                {results.notes.map((note) => (
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
            <SectionHeading meta={`${results.links.length} result${results.links.length === 1 ? "" : "s"}`} title="Matching links" />
            {results.links.length === 0 ? (
              <p>No private links matched this query.</p>
            ) : (
              <div className="link-list">
                {results.links.map((link) => (
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
                          <span>Query</span>
                          <span>{results.query}</span>
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
                          <p className="field-note">A generated summary will appear here after a successful enrichment run.</p>
                        )}
                      </div>
                      <div className="note-generated-copy secondary-generated-copy">
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
                    </div>
                  </article>
                ))}
              </div>
            )}
          </Surface>
        </div>
      ) : (
        <Surface className="secondary-list-panel" density="compact" tone="panel">
          <SectionHeading meta="v1 boundaries" title="Search scope" />
          <p>Search matches note titles, link titles, link URLs, and shared tag names. Note bodies and link summaries stay out of scope in v1.</p>
        </Surface>
      )}
    </div>
  );
}
