import { createLinkAction, retryLinkEnrichmentAction } from "@/app/app/links/actions";
import { Button, MetadataRow, SectionHeading, Surface, TagChip, TagList } from "@/components/ui/primitives";
import { EnrichmentPendingRefresh } from "@/features/enrichment/components/pending-refresh";
import { EnrichmentStatusBlock } from "@/features/enrichment/components/status-block";
import { listOwnerLinks } from "@/features/links/service";
import { requireOwnerSession } from "@/lib/auth/owner-session";

type LinksPageProps = {
  searchParams?: Promise<{
    saved?: string;
    retried?: string;
    error?: string;
  }>;
};

function getStatusMessage(error?: string) {
  switch (error) {
    case "duplicate-url":
      return "That URL is already saved in your private links.";
    case "invalid-url":
      return "Enter a complete http:// or https:// URL.";
    case "missing-title":
      return "Enter a title for the saved link.";
    default:
      return undefined;
  }
}

export default async function LinksPage({ searchParams }: LinksPageProps) {
  const owner = await requireOwnerSession();
  const resolvedSearchParams = (await searchParams) ?? {};
  const links = await listOwnerLinks(owner.id);
  const pendingLinks = links.filter((link) => link.enrichment.status === "pending").length;
  const statusMessage =
    resolvedSearchParams.saved === "1"
      ? "Link saved."
      : resolvedSearchParams.retried === "1"
        ? "Retry requested."
        : getStatusMessage(resolvedSearchParams.error);

  return (
    <div className="feature-layout">
      <EnrichmentPendingRefresh enabled={links.some((link) => link.enrichment.status === "pending")} />
      <Surface tone="hero">
        <p className="eyebrow">Private links</p>
        <h1>Save links for later retrieval.</h1>
        <p className="lede">
          Manual bookmark capture stays private in v1. Save the URL and title first, then let Minakeep generate the AI
          summary and shared tags after save.
        </p>
        <div className="summary-row">
          <div>
            <strong>Saved links</strong>
            <span>{links.length} private reference{links.length === 1 ? "" : "s"}</span>
          </div>
          <div>
            <strong>AI queue</strong>
            <span>{pendingLinks === 0 ? "No pending enrichment" : `${pendingLinks} link${pendingLinks === 1 ? "" : "s"} pending`}</span>
          </div>
          <div>
            <strong>Visibility</strong>
            <span>Links remain private even when notes can be published</span>
          </div>
        </div>
        {statusMessage ? (
          <p className={resolvedSearchParams.error ? "status-note status-note-error" : "status-note"}>{statusMessage}</p>
        ) : null}
      </Surface>

      <div className="link-manager-grid">
        <Surface action={createLinkAction} as="form" className="link-form" tone="panel">
          <SectionHeading meta="Manual URL and title" title="Capture a link" />
          <label className="field-group">
            <span>URL</span>
            <input
              autoComplete="url"
              className="text-input"
              name="url"
              placeholder="https://example.com/article"
              required
              type="url"
            />
          </label>
          <label className="field-group">
            <span>Title</span>
            <input
              autoComplete="off"
              className="text-input"
              name="title"
              placeholder="Reference title"
              required
              type="text"
            />
          </label>
          <p className="field-note">AI summary and shared tags are generated automatically after save.</p>
          <div className="button-row">
            <Button type="submit">Save link</Button>
          </div>
        </Surface>

        <Surface className="link-list-panel" tone="panel">
          <SectionHeading meta="Generated metadata stays secondary" title="Saved links" />
          {links.length === 0 ? (
            <p>No saved links yet. Capture the first private bookmark from this page.</p>
          ) : (
            <div className="link-list">
              {links.map((link) => (
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
                      <p className="link-summary" data-testid="link-ai-summary">
                        {link.summary}
                      </p>
                    ) : (
                      <p className="field-note">A generated summary will appear here after a successful enrichment run.</p>
                    )}
                  </div>
                  <div className="note-generated-copy">
                    <strong>AI tags</strong>
                    <TagList aria-label="Link tags" data-testid="link-ai-tags">
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
                  {link.enrichment.status === "failed" ? (
                    <form action={retryLinkEnrichmentAction.bind(null, link.id)}>
                      <Button type="submit" variant="ghost">
                        Retry AI enrichment
                      </Button>
                    </form>
                  ) : null}
                </article>
              ))}
            </div>
          )}
        </Surface>
      </div>
    </div>
  );
}
