import { createLinkAction, publishLinkAction, retryLinkEnrichmentAction, unpublishLinkAction } from "@/app/app/links/actions";
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
import { listOwnerLinks } from "@/features/links/service";
import { requireOwnerSession } from "@/lib/auth/owner-session";

type LinksPageProps = {
  searchParams?: Promise<{
    saved?: string;
    retried?: string;
    published?: string;
    unpublished?: string;
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
  const publishedLinks = links.filter((link) => link.isPublished).length;
  const dateFormatter = new Intl.DateTimeFormat("en", { dateStyle: "medium" });
  const statusMessage =
    resolvedSearchParams.saved === "1"
      ? "Link saved."
      : resolvedSearchParams.retried === "1"
        ? "Retry requested."
        : resolvedSearchParams.published === "1"
          ? "Link published."
          : resolvedSearchParams.unpublished === "1"
            ? "Link unpublished."
            : getStatusMessage(resolvedSearchParams.error);

  return (
    <div className="feature-layout">
      <EnrichmentPendingRefresh enabled={links.some((link) => link.enrichment.status === "pending")} />
      <Surface className="secondary-route-hero" density="compact" tone="hero">
        <IntroBlock
          compact
          description="Save the URL and title first, then let Minakeep generate the AI summary and shared tags. Links stay private until the owner explicitly publishes them to the public showroom."
          eyebrow="Private links"
          title="Reference shelf"
        >
          <div aria-label="Links overview" className="ui-support-grid secondary-summary-grid">
            <DetailBlock title="Saved links">
              <p>{links.length} private reference{links.length === 1 ? "" : "s"}</p>
            </DetailBlock>
            <DetailBlock title="AI queue">
              <p>{pendingLinks === 0 ? "No pending enrichment" : `${pendingLinks} link${pendingLinks === 1 ? "" : "s"} pending`}</p>
            </DetailBlock>
            <DetailBlock title="Visibility">
              <p>
                {publishedLinks === 0
                  ? "All links are private until explicitly published."
                  : `${publishedLinks} link${publishedLinks === 1 ? "" : "s"} visible on the public showroom.`}
              </p>
            </DetailBlock>
          </div>
        </IntroBlock>
        {statusMessage ? (
          <p className={resolvedSearchParams.error ? "status-note status-note-error" : "status-note"}>{statusMessage}</p>
        ) : null}
      </Surface>

      <div className="link-manager-grid secondary-route-grid">
        <Surface action={createLinkAction} as="form" className="link-form secondary-control-panel" density="compact" tone="panel">
          <SectionHeading meta="Manual URL and title" title="Capture" />
          <FormField label="URL">
            <input
              autoComplete="url"
              className="text-input"
              name="url"
              placeholder="https://example.com/article"
              required
              type="url"
            />
          </FormField>
          <FormField label="Title">
            <input
              autoComplete="off"
              className="text-input"
              name="title"
              placeholder="Reference title"
              required
              type="text"
            />
          </FormField>
          <p className="field-note">AI summary and shared tags are generated automatically after save.</p>
          <div className="button-row">
            <Button type="submit">Save link</Button>
          </div>
        </Surface>

        <Surface className="link-list-panel secondary-list-panel secondary-link-panel" density="compact" tone="panel">
          <SectionHeading meta={`${links.length} saved`} title="Saved links" />
          {links.length === 0 ? (
            <p>No saved links yet. Capture the first private bookmark from this page.</p>
          ) : (
            <div className="link-list">
              {links.map((link) => (
                <article className="link-list-item secondary-link-item" key={link.id}>
                  <div className="secondary-link-main">
                    <div className="link-list-heading secondary-link-heading">
                      <MetadataRow leading>
                        <span>{link.isPublished ? "Published link" : "Private link"}</span>
                        <span>{dateFormatter.format(link.isPublished && link.publishedAt ? link.publishedAt : link.updatedAt)}</span>
                      </MetadataRow>
                      <a className="note-list-link" href={link.url} rel="noopener noreferrer" target="_blank">
                        {link.title}
                      </a>
                      <p className="link-url">{link.url}</p>
                    </div>
                    <div className="link-list-footer secondary-link-footer">
                      <MetadataRow>
                        <span>Visibility</span>
                        <span>{link.isPublished ? "Public showroom" : "Owner only"}</span>
                      </MetadataRow>
                    </div>
                  </div>
                  <div className="secondary-link-meta">
                    <EnrichmentStatusBlock detailClassName="secondary-link-status" state={link.enrichment} />
                    <div className="note-generated-copy secondary-generated-copy">
                      <strong>AI summary:</strong>
                      {link.summary ? (
                        <p className="link-summary" data-testid="link-ai-summary">
                          {link.summary}
                        </p>
                      ) : (
                        <p className="field-note">A generated summary will appear here after a successful enrichment run.</p>
                      )}
                    </div>
                    <div className="note-generated-copy secondary-generated-copy">
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
                  </div>
                  <div className="button-row secondary-link-actions">
                    {link.isPublished ? (
                      <form action={unpublishLinkAction.bind(null, link.id)}>
                        <Button type="submit" variant="ghost">
                          Unpublish link
                        </Button>
                      </form>
                    ) : (
                      <form action={publishLinkAction.bind(null, link.id)}>
                        <Button type="submit">Publish link</Button>
                      </form>
                    )}
                  </div>
                  {link.enrichment.status === "failed" ? (
                    <form action={retryLinkEnrichmentAction.bind(null, link.id)} className="secondary-link-retry">
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
