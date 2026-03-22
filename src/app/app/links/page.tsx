import {
  createLinkAction,
  publishLinkAction,
  refreshLinkFaviconAction,
  retryLinkEnrichmentAction,
  unpublishLinkAction
} from "@/app/app/links/actions";
import {
  Button,
  Disclosure,
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
import { listOwnerLinks } from "@/features/links/service";
import { requireOwnerSession } from "@/lib/auth/owner-session";

type LinksPageProps = {
  searchParams?: Promise<{
    saved?: string;
    retried?: string;
    published?: string;
    unpublished?: string;
    favicon?: string;
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
            : resolvedSearchParams.favicon === "1"
              ? "Favicon refresh requested."
              : getStatusMessage(resolvedSearchParams.error);

  return (
    <div className="feature-layout">
      <EnrichmentPendingRefresh enabled={links.some((link) => link.enrichment.status === "pending")} />
      <Surface className="secondary-route-hero" density="compact" tone="hero">
        <IntroBlock
          compact
          description="Save a URL and title."
          eyebrow="Private links"
          title="Reference shelf"
        >
          <MetadataRow aria-label="Links overview" className="secondary-route-meta" leading>
            <span>{links.length} saved</span>
            <span>{pendingLinks === 0 ? "AI clear" : `${pendingLinks} pending`}</span>
            <span>{publishedLinks === 0 ? "All private" : `${publishedLinks} public`}</span>
          </MetadataRow>
        </IntroBlock>
        {statusMessage ? (
          <p className={resolvedSearchParams.error ? "status-note status-note-error" : "status-note"}>{statusMessage}</p>
        ) : null}
      </Surface>

      <div className="link-manager-grid secondary-route-grid">
        <Surface action={createLinkAction} as="form" className="link-form secondary-control-panel" density="compact" tone="panel">
          <SectionHeading meta="Manual URL and title" title="Capture" />
          <div className="owner-links-capture-fields">
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
            <div className="button-row owner-links-capture-actions">
              <Button type="submit">Save link</Button>
            </div>
          </div>
          <Disclosure summary="After save">
            <p>AI summary and tags are added automatically. Links stay private until you publish them.</p>
          </Disclosure>
        </Surface>

        <Surface className="link-list-panel secondary-list-panel secondary-link-panel" density="compact" tone="panel">
          <SectionHeading meta={`${links.length} saved`} title="Saved links" />
          {links.length === 0 ? (
            <p>No saved links yet.</p>
          ) : (
            <div className="link-list">
              {links.map((link) => (
                <article className="link-list-item secondary-link-item" key={link.id}>
                  <div className="secondary-link-main">
                    <div className="link-list-heading secondary-link-heading">
                      <div className="secondary-link-favicon-stack">
                        <LinkFavicon
                          faviconAssetId={link.faviconAssetId}
                          frameClassName="link-favicon-frame secondary-link-favicon-frame"
                          imageClassName="link-favicon-image secondary-link-favicon-image"
                          testId="owner-link-favicon"
                        />
                        <form action={refreshLinkFaviconAction.bind(null, link.id)} className="secondary-link-favicon-refresh">
                          <Button aria-label="Refresh favicon" title="Refresh favicon" type="submit" variant="ghost">
                            ↻
                          </Button>
                        </form>
                      </div>
                      <div className="secondary-link-heading-copy">
                        <MetadataRow leading>
                          <span>{link.isPublished ? "Published link" : "Private link"}</span>
                          <span>{dateFormatter.format(link.isPublished && link.publishedAt ? link.publishedAt : link.updatedAt)}</span>
                        </MetadataRow>
                        <a className="note-list-link" href={link.url} rel="noopener noreferrer" target="_blank">
                          {link.title}
                        </a>
                        <p className="link-url">{link.url}</p>
                      </div>
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
                        <p className="field-note">Waiting for AI summary.</p>
                      )}
                    </div>
                    <div className="note-generated-copy secondary-generated-copy">
                      <strong>AI tags</strong>
                      <TagList aria-label="Link tags" data-testid="link-ai-tags">
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
