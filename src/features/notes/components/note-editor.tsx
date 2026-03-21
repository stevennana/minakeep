"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";

import { Button, ButtonLink, MetadataRow, SectionHeading, Surface, TagChip, TagList } from "@/components/ui/primitives";
import { EnrichmentPendingRefresh } from "@/features/enrichment/components/pending-refresh";
import { EnrichmentStatusBlock } from "@/features/enrichment/components/status-block";
import type { EnrichmentState } from "@/features/enrichment/types";
import { getEnrichmentStatusLabel } from "@/features/enrichment/types";
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
    <Button type="submit">
      {pending ? "Saving..." : label}
    </Button>
  );
}

function PublicationButton({ idleLabel, pendingLabel }: { idleLabel: string; pendingLabel: string }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" variant="ghost">
      {pending ? pendingLabel : idleLabel}
    </Button>
  );
}

function RetryButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" variant="ghost">
      {pending ? "Retrying..." : "Retry AI enrichment"}
    </Button>
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
  const [title, setTitle] = useState(initialTitle);
  const [markdown, setMarkdown] = useState(initialMarkdown);
  const previewTitle = title.trim() || "Untitled note";
  const previewHtml = renderMarkdownToHtml(markdown);

  return (
    <div className="note-editor-shell">
      <EnrichmentPendingRefresh enabled={enrichment?.status === "pending"} />
      <Surface className="note-editor-intro" tone="hero">
        <p className="eyebrow">Private note authoring</p>
        <h1>{formTitle}</h1>
        <p className="lede">{formDescription}</p>
        <div className="summary-row">
          <div>
            <strong>Drafting surface</strong>
            <span>Textarea editing with live markdown preview</span>
          </div>
          <div>
            <strong>Publishing</strong>
            <span>{publication?.isPublished ? "Currently visible on public routes" : "Private until explicitly published"}</span>
          </div>
          <div>
            <strong>AI metadata</strong>
            <span>{enrichment ? getEnrichmentStatusLabel(enrichment.status) : "Available after the first save"}</span>
          </div>
        </div>
        {publication ? (
          <div className="publication-panel">
            <MetadataRow>
              <span>{publication.isPublished ? "Published" : "Private draft"}</span>
              <span>{publication.isPublished ? "Visible on public routes" : "Hidden from public routes"}</span>
            </MetadataRow>
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
                <ButtonLink href={publication.publicHref} variant="ghost">
                  View public note
                </ButtonLink>
              ) : null}
            </div>
          </div>
        ) : null}
        {savedNotice ? <p className="status-note">{savedNotice}</p> : null}
      </Surface>

      {enrichment ? (
        <Surface className="note-generated-panel" data-testid="note-enrichment-panel" tone="panel">
          <SectionHeading meta="Secondary to authored content" title="AI note metadata" />
          <EnrichmentStatusBlock state={enrichment} />
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
            <TagList data-testid="note-ai-tags">
              {generatedTags.length === 0 ? (
                <TagChip muted>No generated tags yet</TagChip>
              ) : (
                generatedTags.map((tag) => (
                  <TagChip key={tag.id}>
                    {tag.name}
                  </TagChip>
                ))
              )}
            </TagList>
          </div>
          {enrichment.status === "failed" && retryAction ? (
            <form action={retryAction}>
              <RetryButton />
            </form>
          ) : null}
        </Surface>
      ) : null}

      <div className="note-editor-grid">
        <Surface action={action} as="form" className="note-form" tone="panel">
          <SectionHeading meta="Title and markdown body" title="Draft" />
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
        </Surface>

        <Surface aria-labelledby="note-preview-heading" className="note-preview-panel" tone="panel">
          <SectionHeading meta="Rendered markdown" title="Preview" />
          <h2 id="note-preview-heading">{previewTitle}</h2>
          <div
            className="markdown-preview"
            data-testid="note-markdown-preview"
            dangerouslySetInnerHTML={{
              __html: previewHtml || "<p>Start writing to see the rendered preview.</p>"
            }}
          />
        </Surface>
      </div>
    </div>
  );
}
