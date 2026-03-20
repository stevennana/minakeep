import { createLinkAction, retryLinkEnrichmentAction } from "@/app/app/links/actions";
import { getEnrichmentStatusDetail, getEnrichmentStatusLabel } from "@/features/enrichment/types";
import { LinkPendingRefresh } from "@/features/links/components/link-pending-refresh";
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
  const statusMessage =
    resolvedSearchParams.saved === "1"
      ? "Link saved."
      : resolvedSearchParams.retried === "1"
        ? "Retry requested."
        : getStatusMessage(resolvedSearchParams.error);

  return (
    <div className="feature-layout">
      <LinkPendingRefresh enabled={links.some((link) => link.enrichment.status === "pending")} />
      <section className="feature-card">
        <p className="eyebrow">Private links</p>
        <h1>Save links for later retrieval.</h1>
        <p className="lede">
          Manual bookmark capture stays private in v1. Save the URL and title first, then let Minakeep generate the AI
          summary and shared tags after save.
        </p>
        {statusMessage ? (
          <p className={resolvedSearchParams.error ? "status-note status-note-error" : "status-note"}>{statusMessage}</p>
        ) : null}
      </section>

      <div className="link-manager-grid">
        <form action={createLinkAction} className="panel-card link-form">
          <strong>Capture a link</strong>
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
            <button className="primary-button" type="submit">
              Save link
            </button>
          </div>
        </form>

        <section className="panel-card link-list-panel">
          <strong>Saved links</strong>
          {links.length === 0 ? (
            <p>No saved links yet. Capture the first private bookmark from this page.</p>
          ) : (
            <div className="link-list">
              {links.map((link) => (
                <article className="link-list-item" key={link.id}>
                  <div className="link-list-heading">
                    <a className="note-list-link" href={link.url} rel="noopener noreferrer" target="_blank">
                      {link.title}
                    </a>
                    <p className="link-url">{link.url}</p>
                  </div>
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
                    <div className="tag-list" aria-label="Link tags" data-testid="link-ai-tags">
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
                  </div>
                  <div className="link-list-footer">
                    <div className="note-meta">
                      <span>Private link</span>
                      <span>{getEnrichmentStatusLabel(link.enrichment.status)}</span>
                      <span>{new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(link.updatedAt)}</span>
                    </div>
                  </div>
                  <p className="field-note">{getEnrichmentStatusDetail(link.enrichment)}</p>
                  {link.enrichment.status === "failed" ? (
                    <form action={retryLinkEnrichmentAction.bind(null, link.id)}>
                      <button className="ghost-button" type="submit">
                        Retry AI enrichment
                      </button>
                    </form>
                  ) : null}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
