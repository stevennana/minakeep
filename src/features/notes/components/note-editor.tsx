"use client";

import { useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { useFormStatus } from "react-dom";

import {
  Button,
  ButtonLink,
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

type CursorState = {
  line: number;
  column: number;
  selection: number;
};

type SelectionRange = {
  start: number;
  end: number;
};

function escapeSourceHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderInlineSourceTokens(source: string): string {
  const pattern = /(`[^`]+`)|(\[([^\]]+)\]\(([^)]+)\))|(\*\*([^*]+)\*\*)|(\*([^*]+)\*)/g;
  let result = "";
  let cursor = 0;

  for (const match of source.matchAll(pattern)) {
    const matchedText = match[0];
    const matchIndex = match.index ?? 0;

    result += escapeSourceHtml(source.slice(cursor, matchIndex));

    if (match[1]) {
      result += `<span class="md-token md-token-code-marker">\`</span><span class="md-token md-token-code">${escapeSourceHtml(matchedText.slice(1, -1))}</span><span class="md-token md-token-code-marker">\`</span>`;
    } else if (match[2]) {
      result += `<span class="md-token md-token-link-marker">[</span><span class="md-token md-token-link-label">${renderInlineSourceTokens(match[3] ?? "")}</span><span class="md-token md-token-link-marker">](</span><span class="md-token md-token-link-url">${escapeSourceHtml(match[4] ?? "")}</span><span class="md-token md-token-link-marker">)</span>`;
    } else if (match[5]) {
      result += `<span class="md-token md-token-strong-marker">**</span><span class="md-token md-token-strong">${renderInlineSourceTokens(match[6] ?? "")}</span><span class="md-token md-token-strong-marker">**</span>`;
    } else if (match[7]) {
      result += `<span class="md-token md-token-emphasis-marker">*</span><span class="md-token md-token-emphasis">${renderInlineSourceTokens(match[8] ?? "")}</span><span class="md-token md-token-emphasis-marker">*</span>`;
    }

    cursor = matchIndex + matchedText.length;
  }

  result += escapeSourceHtml(source.slice(cursor));

  return result;
}

function renderHighlightedSource(markdown: string) {
  if (!markdown) {
    return `<span class="md-line md-line-placeholder"><span class="md-token md-token-placeholder"># Start writing

Use headings, lists, quotes, links, and code without leaving markdown source.</span></span>`;
  }

  const lines = markdown.replace(/\r\n?/g, "\n").split("\n");
  const highlightedLines: string[] = [];
  let insideFence = false;

  for (const line of lines) {
    const trimmedLine = line.trim();

    if (!insideFence && /^(\s*)(#{1,6})(\s+)(.*)$/.test(line)) {
      const [, indent = "", hashes = "", gap = "", content = ""] = line.match(/^(\s*)(#{1,6})(\s+)(.*)$/) ?? [];
      highlightedLines.push(
        `<span class="md-line md-line-heading">${escapeSourceHtml(indent)}<span class="md-token md-token-heading-marker">${escapeSourceHtml(hashes)}</span>${escapeSourceHtml(gap)}<span class="md-token md-token-heading">${renderInlineSourceTokens(content)}</span></span>`
      );
      continue;
    }

    if (trimmedLine.startsWith("```")) {
      const fenceBody = line.replace(/^(\s*)```/, "$1");
      const language = trimmedLine.slice(3);
      highlightedLines.push(
        `<span class="md-line md-line-fence">${escapeSourceHtml(fenceBody.slice(0, fenceBody.length - language.length))}<span class="md-token md-token-fence-marker">\`\`\`</span>${language ? `<span class="md-token md-token-fence-language">${escapeSourceHtml(language)}</span>` : ""}</span>`
      );
      insideFence = !insideFence;
      continue;
    }

    if (insideFence) {
      highlightedLines.push(`<span class="md-line md-line-code">${escapeSourceHtml(line) || " "}</span>`);
      continue;
    }

    if (/^(\s*)(>\s?)(.*)$/.test(line)) {
      const [, indent = "", marker = "", content = ""] = line.match(/^(\s*)(>\s?)(.*)$/) ?? [];
      highlightedLines.push(
        `<span class="md-line md-line-quote">${escapeSourceHtml(indent)}<span class="md-token md-token-quote-marker">${escapeSourceHtml(marker)}</span><span class="md-token md-token-quote">${renderInlineSourceTokens(content)}</span></span>`
      );
      continue;
    }

    if (/^(\s*)((?:[-*])|(?:\d+\.))(\s+)(.*)$/.test(line)) {
      const [, indent = "", marker = "", gap = "", content = ""] = line.match(/^(\s*)((?:[-*])|(?:\d+\.))(\s+)(.*)$/) ?? [];
      highlightedLines.push(
        `<span class="md-line md-line-list">${escapeSourceHtml(indent)}<span class="md-token md-token-list-marker">${escapeSourceHtml(marker)}</span>${escapeSourceHtml(gap)}<span class="md-token md-token-list">${renderInlineSourceTokens(content)}</span></span>`
      );
      continue;
    }

    if (/^[-*_]{3,}$/.test(trimmedLine)) {
      highlightedLines.push(`<span class="md-line md-line-rule"><span class="md-token md-token-rule">${escapeSourceHtml(line)}</span></span>`);
      continue;
    }

    highlightedLines.push(`<span class="md-line">${renderInlineSourceTokens(line) || " "}</span>`);
  }

  return highlightedLines.join("\n");
}

function getCursorState(markdown: string, selectionStart: number, selectionEnd: number): CursorState {
  const normalizedStart = Math.max(0, Math.min(selectionStart, markdown.length));
  const normalizedEnd = Math.max(normalizedStart, Math.min(selectionEnd, markdown.length));
  const beforeCursor = markdown.slice(0, normalizedStart);
  const line = beforeCursor.split("\n").length;
  const lastBreak = beforeCursor.lastIndexOf("\n");

  return {
    line,
    column: normalizedStart - lastBreak,
    selection: normalizedEnd - normalizedStart
  };
}

function getLineRange(markdown: string, start: number, end: number) {
  const lineStart = markdown.lastIndexOf("\n", Math.max(0, start - 1)) + 1;
  const nextBreak = markdown.indexOf("\n", end);
  const lineEnd = nextBreak === -1 ? markdown.length : nextBreak;

  return {
    lineEnd,
    lineStart,
    lineText: markdown.slice(lineStart, lineEnd)
  };
}

function applyMarkdownReplacement(markdown: string, selection: SelectionRange, replacement: string): { nextMarkdown: string; nextSelection: SelectionRange } {
  const nextMarkdown = `${markdown.slice(0, selection.start)}${replacement}${markdown.slice(selection.end)}`;
  const nextCursor = selection.start + replacement.length;

  return {
    nextMarkdown,
    nextSelection: {
      end: nextCursor,
      start: nextCursor
    }
  };
}

function indentSelectedLines(markdown: string, selection: SelectionRange, remove = false) {
  const lineStart = markdown.lastIndexOf("\n", Math.max(0, selection.start - 1)) + 1;
  const boundaryIndex = selection.end > 0 && markdown[selection.end - 1] === "\n" ? selection.end - 1 : selection.end;
  const nextBreak = markdown.indexOf("\n", boundaryIndex);
  const lineEnd = nextBreak === -1 ? markdown.length : nextBreak;
  const block = markdown.slice(lineStart, lineEnd);
  const lines = block.split("\n");

  const transformedLines = lines.map((line) => {
    if (!remove) {
      return `  ${line}`;
    }

    if (line.startsWith("  ")) {
      return line.slice(2);
    }

    if (line.startsWith("\t")) {
      return line.slice(1);
    }

    if (line.startsWith(" ")) {
      return line.slice(1);
    }

    return line;
  });

  const nextBlock = transformedLines.join("\n");
  const nextMarkdown = `${markdown.slice(0, lineStart)}${nextBlock}${markdown.slice(lineEnd)}`;
  const firstLineDelta = transformedLines[0].length - lines[0].length;

  return {
    nextMarkdown,
    nextSelection: {
      end: lineStart + nextBlock.length,
      start: Math.max(lineStart, selection.start + firstLineDelta)
    }
  };
}

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
  const [editorScrollTop, setEditorScrollTop] = useState(0);
  const [editorScrollLeft, setEditorScrollLeft] = useState(0);
  const [cursorState, setCursorState] = useState<CursorState>(() => getCursorState(initialMarkdown, 0, 0));
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const editorHintId = useId();
  const previewTitle = title.trim() || "Untitled note";
  const previewHtml = renderMarkdownToHtml(markdown);
  const previewStyle = {
    "--editor-scroll-left": `${editorScrollLeft}px`,
    "--editor-scroll-top": `${editorScrollTop}px`
  } as CSSProperties;
  const lineCount = markdown.split("\n").length;
  const wordCount = markdown.trim() ? markdown.trim().split(/\s+/).length : 0;
  const characterCount = markdown.length;
  const lineNumbers = Array.from({ length: lineCount }, (_, index) => index + 1);

  function syncEditorState(textarea: HTMLTextAreaElement) {
    setEditorScrollTop(textarea.scrollTop);
    setEditorScrollLeft(textarea.scrollLeft);
    setCursorState(getCursorState(markdown, textarea.selectionStart, textarea.selectionEnd));
  }

  function queueSelection(nextSelection: SelectionRange) {
    requestAnimationFrame(() => {
      const textarea = textareaRef.current;

      if (!textarea) {
        return;
      }

      textarea.focus();
      textarea.setSelectionRange(nextSelection.start, nextSelection.end);
      syncEditorState(textarea);
    });
  }

  function updateMarkdown(nextMarkdown: string, nextSelection?: SelectionRange) {
    setMarkdown(nextMarkdown);

    if (nextSelection) {
      queueSelection(nextSelection);
    }
  }

  function handleMarkdownChange(nextMarkdown: string) {
    setMarkdown(nextMarkdown);

    const textarea = textareaRef.current;

    if (textarea) {
      setCursorState(getCursorState(nextMarkdown, textarea.selectionStart, textarea.selectionEnd));
    }
  }

  function handleEditorKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    const textarea = event.currentTarget;
    const selection = {
      end: textarea.selectionEnd,
      start: textarea.selectionStart
    };

    if (event.key === "Tab") {
      event.preventDefault();

      if (selection.start !== selection.end || event.shiftKey) {
        const indented = indentSelectedLines(markdown, selection, event.shiftKey);
        updateMarkdown(indented.nextMarkdown, indented.nextSelection);
        return;
      }

      const insertedIndent = applyMarkdownReplacement(markdown, selection, "  ");
      updateMarkdown(insertedIndent.nextMarkdown, insertedIndent.nextSelection);
      return;
    }

    if (event.key !== "Enter" || selection.start !== selection.end) {
      return;
    }

    const { lineStart, lineText } = getLineRange(markdown, selection.start, selection.end);
    const cursorWithinLine = selection.start - lineStart;

    if (cursorWithinLine !== lineText.length) {
      return;
    }

    const orderedMatch = lineText.match(/^(\s*)(\d+)\.\s+(.*)$/);
    const unorderedMatch = lineText.match(/^(\s*)([-*])\s+(.*)$/);
    const quoteMatch = lineText.match(/^(\s*>\s?)(.*)$/);

    if (orderedMatch) {
      event.preventDefault();

      const [, indent = "", index = "1", content = ""] = orderedMatch;
      const replacement = content.trim() ? `\n${indent}${Number(index) + 1}. ` : "\n";
      const nextValue = applyMarkdownReplacement(markdown, selection, replacement);
      updateMarkdown(nextValue.nextMarkdown, nextValue.nextSelection);
      return;
    }

    if (unorderedMatch) {
      event.preventDefault();

      const [, indent = "", marker = "-", content = ""] = unorderedMatch;
      const replacement = content.trim() ? `\n${indent}${marker} ` : "\n";
      const nextValue = applyMarkdownReplacement(markdown, selection, replacement);
      updateMarkdown(nextValue.nextMarkdown, nextValue.nextSelection);
      return;
    }

    if (quoteMatch) {
      event.preventDefault();

      const [, marker = "> ", content = ""] = quoteMatch;
      const replacement = content.trim() ? `\n${marker}` : "\n";
      const nextValue = applyMarkdownReplacement(markdown, selection, replacement);
      updateMarkdown(nextValue.nextMarkdown, nextValue.nextSelection);
    }
  }

  useEffect(() => {
    const textarea = textareaRef.current;

    if (!textarea) {
      return;
    }

    setEditorScrollTop(textarea.scrollTop);
    setEditorScrollLeft(textarea.scrollLeft);
    setCursorState(getCursorState(markdown, textarea.selectionStart, textarea.selectionEnd));
  }, [markdown]);

  return (
    <div className="note-editor-shell">
      <EnrichmentPendingRefresh enabled={enrichment?.status === "pending"} />
      <Surface className="note-editor-intro" density="compact" tone="hero">
        <IntroBlock compact description={formDescription} eyebrow="Private note authoring" title={formTitle}>
          <div className="ui-support-grid ui-support-grid-balanced">
            <DetailBlock title="Drafting surface">
              <p>Source-first markdown workbench with syntax-aware editing, live preview, and smarter list handling.</p>
            </DetailBlock>
            <DetailBlock title="Publishing">
              <p>{publication?.isPublished ? "Currently visible on public routes." : "Private until explicitly published."}</p>
            </DetailBlock>
            <DetailBlock title="AI metadata">
              <p>{enrichment ? getEnrichmentStatusLabel(enrichment.status) : "Available after the first save."}</p>
            </DetailBlock>
          </div>
        </IntroBlock>
        {publication ? (
          <Surface className="publication-panel" tone="inset">
            <MetadataRow leading>
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
          </Surface>
        ) : null}
        {savedNotice ? <p className="status-note">{savedNotice}</p> : null}
      </Surface>

      {enrichment ? (
        <Surface className="note-generated-panel" data-testid="note-enrichment-panel" density="compact" tone="panel">
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
        <Surface action={action} as="form" className="note-form ui-form-stack" density="compact" tone="panel">
          <SectionHeading meta="Source-first markdown workbench" title="Draft" />
          <FormField label="Title">
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
          </FormField>

          <FormField
            className="note-body-field"
            hint="Markdown stays the saved note body. Tab indents selected lines and Enter continues lists or blockquotes."
            label="Markdown body"
          >
            <div className="note-editor-workbench" data-testid="note-markdown-workbench">
              <div className="note-editor-toolbar">
                <div className="note-editor-toolbar-copy">
                  <strong>Markdown source</strong>
                  <span className="field-note" id={editorHintId}>
                    Syntax-aware editing keeps the source visible and saves one markdown string.
                  </span>
                </div>
                <div className="note-editor-statusbar" role="status">
                  <span>L{cursorState.line}:C{cursorState.column}</span>
                  <span>{lineCount} lines</span>
                  <span>{wordCount} words</span>
                  <span>{characterCount} chars</span>
                  {cursorState.selection > 0 ? <span>{cursorState.selection} selected</span> : null}
                </div>
              </div>

              <div className="note-editor-surface" style={previewStyle}>
                <div aria-hidden="true" className="note-editor-gutter">
                  <div
                    className="note-editor-gutter-track"
                    style={{
                      transform: `translateY(${-editorScrollTop}px)`
                    }}
                  >
                    {lineNumbers.map((lineNumber) => (
                      <span key={lineNumber}>{String(lineNumber).padStart(2, "0")}</span>
                    ))}
                  </div>
                </div>

                <div className="note-editor-stage">
                  <pre aria-hidden="true" className="note-editor-highlight">
                    <code
                      className="note-editor-highlight-content"
                      dangerouslySetInnerHTML={{
                        __html: renderHighlightedSource(markdown)
                      }}
                    />
                  </pre>

                  <textarea
                    aria-label="Markdown body"
                    aria-describedby={editorHintId}
                    className="note-editor-input"
                    data-testid="note-markdown-input"
                    name="markdown"
                    onChange={(event) => handleMarkdownChange(event.target.value)}
                    onClick={(event) => syncEditorState(event.currentTarget)}
                    onKeyDown={handleEditorKeyDown}
                    onKeyUp={(event) => syncEditorState(event.currentTarget)}
                    onScroll={(event) => syncEditorState(event.currentTarget)}
                    onSelect={(event) => syncEditorState(event.currentTarget)}
                    ref={textareaRef}
                    spellCheck="true"
                    value={markdown}
                  />
                </div>
              </div>
            </div>
          </FormField>

          <div className="button-row">
            <SaveButton label={submitLabel} />
          </div>
        </Surface>

        <Surface aria-labelledby="note-preview-heading" className="note-preview-panel" density="compact" tone="panel">
          <SectionHeading meta="Rendered from the same markdown source" title="Preview" />
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
