"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";

import type { EnrichmentState } from "@/features/enrichment/types";
import { getEnrichmentStatusDetail, getEnrichmentStatusLabel } from "@/features/enrichment/types";
import { renderMarkdownToHtml } from "@/features/notes/markdown";
import type { SavedTag } from "@/features/tags/types";

type NoteEditorProps = {
  initialTitle: string;
  initialMarkdown: string;
  action: (formData: FormData) => void | Promise<void>;
  formTitle: string;
  formDescription: string;
  submitLabel: string;
  savedNotice?: string;
  enrichment?: EnrichmentState;
  generatedSummary?: string | null;
  generatedTags?: SavedTag[];
  retryAction?: () => void | Promise<void>;
  publication?: {
    isPublished: boolean;
    publicHref: `/notes/${string}`;
    publishAction: () => void | Promise<void>;
    unpublishAction: () => void | Promise<void>;
  };
};

function SaveButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <button className="primary-button" type="submit">
      {pending ? "Saving..." : label}
    </button>
  );
}

function PublicationButton({ idleLabel, pendingLabel }: { idleLabel: string; pendingLabel: string }) {
  const { pending } = useFormStatus();

  return (
    <button className="ghost-button" type="submit">
      {pending ? pendingLabel : idleLabel}
    </button>
  );
}

function RetryButton() {
  const { pending } = useFormStatus();

  return (
    <button className="ghost-button" type="submit">
      {pending ? "Retrying..." : "Retry AI enrichment"}
    </button>
  );
}

export function NoteEditor({
  initialTitle,
  initialMarkdown,
  action,
  formTitle,
  formDescription,
  submitLabel,
  savedNotice,
  enrichment,
  generatedSummary,
  generatedTags = [],
  retryAction,
  publication
}: NoteEditorProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle);
  const [markdown, setMarkdown] = useState(initialMarkdown);
  const previewTitle = title.trim() || "Untitled note";
  const previewHtml = renderMarkdownToHtml(markdown);

  useEffect(() => {
    if (enrichment?.status !== "pending") {
      return;
    }

    const intervalId = window.setInterval(() => {
      router.refresh();
    }, 2000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [enrichment?.status, router]);

  return (
    <div className="note-editor-shell">
      <section className="panel-card note-editor-intro">
        <p className="eyebrow">Private note authoring</p>
        <h1>{formTitle}</h1>
        <p className="lede">{formDescription}</p>
        {publication ? (
          <div className="publication-panel">
            <div className="note-meta">
              <span>{publication.isPublished ? "Published" : "Private draft"}</span>
              <span>{publication.isPublished ? "Visible on public routes" : "Hidden from public routes"}</span>
            </div>
            <div className="button-row">
              {publication.isPublished ? (
                <form action={publication.unpublishAction}>
                  <PublicationButton idleLabel="Unpublish note" pendingLabel="Unpublishing..." />
                </form>
              ) : (
                <form action={publication.publishAction}>
                  <PublicationButton idleLabel="Publish note" pendingLabel="Publishing..." />
                </form>
              )}
              {publication.isPublished ? (
                <Link className="ghost-button" href={publication.publicHref}>
                  View public note
                </Link>
              ) : null}
            </div>
          </div>
        ) : null}
        {savedNotice ? <p className="status-note">{savedNotice}</p> : null}
      </section>

      {enrichment ? (
        <section className="panel-card note-generated-panel" data-testid="note-enrichment-panel">
          <p className="eyebrow">AI note metadata</p>
          <div className="note-meta">
            <span>{getEnrichmentStatusLabel(enrichment.status)}</span>
            <span>{getEnrichmentStatusDetail(enrichment)}</span>
          </div>
          <div className="note-generated-copy">
            <strong>AI summary</strong>
            {generatedSummary ? (
              <p data-testid="note-ai-summary">{generatedSummary}</p>
            ) : (
              <p className="field-note">A generated summary will appear here after a successful enrichment run.</p>
            )}
          </div>
          <div className="note-generated-copy">
            <strong>AI tags</strong>
            <div className="tag-list" data-testid="note-ai-tags">
              {generatedTags.length === 0 ? (
                <span className="tag-pill tag-pill-muted">No generated tags yet</span>
              ) : (
                generatedTags.map((tag) => (
                  <span className="tag-pill" key={tag.id}>
                    {tag.name}
                  </span>
                ))
              )}
            </div>
          </div>
          {enrichment.status === "failed" && retryAction ? (
            <form action={retryAction}>
              <RetryButton />
            </form>
          ) : null}
        </section>
      ) : null}

      <div className="note-editor-grid">
        <form action={action} className="panel-card note-form">
          <label className="field-group">
            <span>Title</span>
            <input
              autoComplete="off"
              className="text-input"
              name="title"
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Draft title"
              required
              type="text"
              value={title}
            />
          </label>

          <label className="field-group note-body-field">
            <span>Markdown body</span>
            <textarea
              className="note-textarea"
              name="markdown"
              onChange={(event) => setMarkdown(event.target.value)}
              placeholder={`# Start writing

Use markdown for headings, lists, links, and code.`}
              spellCheck="true"
              value={markdown}
            />
          </label>

          <div className="button-row">
            <SaveButton label={submitLabel} />
          </div>
        </form>

        <section aria-labelledby="note-preview-heading" className="panel-card note-preview-panel">
          <p className="eyebrow">Preview</p>
          <h2 id="note-preview-heading">{previewTitle}</h2>
          <div
            className="markdown-preview"
            data-testid="note-markdown-preview"
            dangerouslySetInnerHTML={{
              __html: previewHtml || "<p>Start writing to see the rendered preview.</p>"
            }}
          />
        </section>
      </div>
    </div>
  );
}
