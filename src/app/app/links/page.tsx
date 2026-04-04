import {
  createLinkAction,
  deleteLinkAction,
  publishLinkAction,
  refreshLinkFaviconAction,
  retryLinkEnrichmentAction,
  unpublishLinkAction
} from "@/app/app/links/actions";
import { unstable_noStore as noStore } from "next/cache";
import { AutoLoadMore } from "@/components/ui/auto-load-more";
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
import {
  countOwnerLinks,
  countPendingOwnerLinks,
  countPublishedOwnerLinks,
  listOwnerLinksPage
} from "@/features/links/service";
import { normalizeIncrementalLimit, OWNER_COLLECTION_PAGE_SIZE } from "@/lib/pagination";
import { requireWorkspaceSession } from "@/lib/auth/owner-session";
import { isReadOnlyWorkspaceRole } from "@/lib/auth/roles";

type LinksPageProps = {
  searchParams?: Promise<{
    saved?: string;
    retried?: string;
    published?: string;
    unpublished?: string;
    deleted?: string;
    favicon?: string;
    error?: string;
    limit?: string;
  }>;
};

function getStatusMessage(error?: string) {
  switch (error) {
    case "delete-confirmation":
      return "Confirm permanent delete before removing this link.";
    case "delete-published":
      return "Unpublish this link before deleting it permanently.";
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
  noStore();

  const workspace = await requireWorkspaceSession();
  const isReadOnly = isReadOnlyWorkspaceRole(workspace.actor.role);
  const captureSurfaceProps = isReadOnly ? ({ as: "div" as const }) : ({ action: createLinkAction, as: "form" as const });
  const resolvedSearchParams = (await searchParams) ?? {};
  const limit = normalizeIncrementalLimit(resolvedSearchParams.limit, OWNER_COLLECTION_PAGE_SIZE);
  const [links, totalLinks, pendingLinks, publishedLinks] = await Promise.all([
    listOwnerLinksPage(workspace.owner.id, limit),
    countOwnerLinks(workspace.owner.id),
    countPendingOwnerLinks(workspace.owner.id),
    countPublishedOwnerLinks(workspace.owner.id)
  ]);
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
            : resolvedSearchParams.deleted === "1"
              ? "Link permanently deleted."
            : resolvedSearchParams.favicon === "1"
              ? "Favicon refresh requested."
              : getStatusMessage(resolvedSearchParams.error);

  return (
    <div className="feature-layout">
      <EnrichmentPendingRefresh enabled={pendingLinks > 0} />
      <Surface className="secondary-route-hero" density="compact" tone="hero">
        <IntroBlock
          compact
          description={isReadOnly ? "Inspect saved links, AI metadata, and publish state." : "Save a URL and title."}
          eyebrow={isReadOnly ? "Read-only demo" : "Private links"}
          title="Reference shelf"
        >
          <MetadataRow aria-label="Links overview" className="secondary-route-meta" leading>
            <span>{totalLinks} saved</span>
            <span>{pendingLinks === 0 ? "AI clear" : `${pendingLinks} pending`}</span>
            <span>{isReadOnly ? "Read-only" : publishedLinks === 0 ? "All private" : `${publishedLinks} public`}</span>
          </MetadataRow>
        </IntroBlock>
        {statusMessage ? (
          <p
            className={
              resolvedSearchParams.error ? "status-note status-note-error" : "status-note"
            }
          >
            {statusMessage}
          </p>
        ) : null}
        {isReadOnly ? (
          <p className="read-only-note">Link capture, publishing, delete, favicon refresh, and AI retry stay disabled in the demo workspace.</p>
        ) : null}
      </Surface>

      <div className="link-manager-grid secondary-route-grid">
        <Surface {...captureSurfaceProps} className="link-form secondary-control-panel" density="compact" tone="panel">
          <SectionHeading meta={isReadOnly ? "Unavailable in demo" : "Manual URL and title"} title="Capture" />
          <div className="owner-links-capture-fields">
            <FormField label="URL">
              <input
                autoComplete="url"
                className="text-input"
                disabled={isReadOnly}
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
                disabled={isReadOnly}
                name="title"
                placeholder="Reference title"
                required
                type="text"
              />
            </FormField>
            <div className="button-row owner-links-capture-actions">
              <Button disabled={isReadOnly} type="submit">
                {isReadOnly ? "Save link unavailable" : "Save link"}
              </Button>
            </div>
          </div>
          <Disclosure summary="After save">
            <p>
              {isReadOnly
                ? "The demo shows the owner workflow, but link creation stays disabled."
                : "AI summary and tags are added automatically. Links stay private until you publish them."}
            </p>
          </Disclosure>
        </Surface>

        <Surface className="link-list-panel secondary-list-panel secondary-link-panel" density="compact" tone="panel">
          <SectionHeading meta={links.length < totalLinks ? `${links.length} of ${totalLinks} loaded` : `${totalLinks} saved`} title="Saved links" />
          {totalLinks === 0 ? (
            <p>No saved links yet.</p>
          ) : (
            <>
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
                          {isReadOnly ? (
                            <Button aria-label="Refresh favicon unavailable" disabled title="Refresh favicon unavailable in read-only mode" type="button" variant="ghost">
                              ↻
                            </Button>
                          ) : (
                            <form action={refreshLinkFaviconAction.bind(null, link.id)} className="secondary-link-favicon-refresh">
                              <Button aria-label="Refresh favicon" title="Refresh favicon" type="submit" variant="ghost">
                                ↻
                              </Button>
                            </form>
                          )}
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
                      {isReadOnly ? (
                        <>
                          <Button disabled type="button" variant="ghost">
                            {link.isPublished ? "Unpublish unavailable" : "Publish unavailable"}
                          </Button>
                          <Button disabled type="button" variant="ghost">
                            Delete unavailable
                          </Button>
                        </>
                      ) : (
                        <>
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
                          {link.isPublished ? (
                            <Button
                              aria-label="Delete unavailable until unpublished"
                              disabled
                              title="Unpublish this link before deleting it permanently."
                              type="button"
                              variant="ghost"
                            >
                              Delete unavailable
                            </Button>
                          ) : (
                            <details className="delete-disclosure secondary-link-delete-disclosure">
                              <summary className="ghost-button delete-disclosure-summary">Delete link</summary>
                              <div className="delete-disclosure-panel">
                                <p>This permanently removes this unpublished link. There is no trash or restore step.</p>
                                <form action={deleteLinkAction.bind(null, link.id)} className="delete-confirmation-form">
                                  <input name="confirmDelete" type="hidden" value="permanent" />
                                  <div className="button-row delete-confirmation-actions">
                                    <Button className="delete-action-button" type="submit">
                                      Delete permanently
                                    </Button>
                                  </div>
                                </form>
                              </div>
                            </details>
                          )}
                        </>
                      )}
                    </div>
                    {link.enrichment.status === "failed" ? (
                      isReadOnly ? (
                        <Button disabled type="button" variant="ghost">
                          Retry unavailable
                        </Button>
                      ) : (
                        <form action={retryLinkEnrichmentAction.bind(null, link.id)} className="secondary-link-retry">
                          <Button type="submit" variant="ghost">
                            Retry AI enrichment
                          </Button>
                        </form>
                      )
                    ) : null}
                  </article>
                ))}
              </div>
              <AutoLoadMore
                buttonLabel="Load more links"
                currentCount={links.length}
                currentLimit={limit}
                pageSize={OWNER_COLLECTION_PAGE_SIZE}
                testId="owner-links-load-more"
                totalCount={totalLinks}
              />
            </>
          )}
        </Surface>
      </div>
    </div>
  );
}
