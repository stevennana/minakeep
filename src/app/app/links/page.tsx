import { createLinkAction } from "@/app/app/links/actions";
import { listOwnerLinks } from "@/features/links/service";
import { requireOwnerSession } from "@/lib/auth/owner-session";

type LinksPageProps = {
  searchParams?: Promise<{
    saved?: string;
    error?: string;
  }>;
};

function getStatusMessage(error?: string) {
  switch (error) {
    case "duplicate-url":
      return "That URL is already saved in your private links.";
    case "invalid-url":
      return "Enter a complete URL, including the protocol.";
    case "missing-title":
      return "Enter a title for the saved link.";
    case "missing-summary":
      return "Enter a summary for the saved link.";
    default:
      return undefined;
  }
}

export default async function LinksPage({ searchParams }: LinksPageProps) {
  const owner = await requireOwnerSession();
  const resolvedSearchParams = (await searchParams) ?? {};
  const links = await listOwnerLinks(owner.id);
  const statusMessage =
    resolvedSearchParams.saved === "1" ? "Link saved." : getStatusMessage(resolvedSearchParams.error);

  return (
    <div className="feature-layout">
      <section className="feature-card">
        <p className="eyebrow">Private links</p>
        <h1>Save links for later retrieval.</h1>
        <p className="lede">
          Manual bookmark capture stays private in v1. Each saved link keeps its URL, title, summary, and shared tags
          inside the owner area only.
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
          <label className="field-group">
            <span>Summary</span>
            <textarea
              className="note-textarea summary-textarea"
              name="summary"
              placeholder="Why this link matters and what you expect to find there later."
              required
            />
          </label>
          <label className="field-group">
            <span>Tags</span>
            <input
              autoComplete="off"
              className="text-input"
              name="tags"
              placeholder="research, reference"
              type="text"
            />
          </label>
          <p className="field-note">Use commas to share tags with the rest of the private vault.</p>
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
                    <a className="note-list-link" href={link.url} rel="noreferrer" target="_blank">
                      {link.title}
                    </a>
                    <p className="link-url">{link.url}</p>
                  </div>
                  <p className="link-summary">{link.summary}</p>
                  <div className="link-list-footer">
                    <div className="tag-list" aria-label="Tags">
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
    </div>
  );
}
