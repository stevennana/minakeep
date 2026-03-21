"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
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
import {
  applyMarkdownReplacement,
  continueMarkdownStructure,
  getViewportSyncedViewMode,
  indentSelectedLines,
  insertMarkdownImage,
  insertMarkdownLink,
  toggleBlockquote,
  toggleBulletList,
  toggleFencedCodeBlock,
  toggleHeading,
  toggleInlineWrap,
  toggleOrderedList,
  type MarkdownEditResult,
  type NoteEditorViewMode,
  type SelectionRange
} from "@/features/notes/editor-markdown";
import { renderMarkdownToHtml } from "@/features/notes/markdown";
import type { SavedTag } from "@/features/tags/types";

type NoteEditorProps = {
  noteId?: string;
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

const desktopViewportQuery = "(min-width: 768px)";

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
  noteId,
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
  const [viewMode, setViewMode] = useState<NoteEditorViewMode>("source");
  const [isDesktopViewport, setIsDesktopViewport] = useState(false);
  const [editorScrollTop, setEditorScrollTop] = useState(0);
  const [cursorState, setCursorState] = useState<CursorState>(() => getCursorState(initialMarkdown, 0, 0));
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageUploadNotice, setImageUploadNotice] = useState<string | null>(null);
  const markdownRef = useRef(initialMarkdown);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const selectionRef = useRef<SelectionRange>({
    end: 0,
    start: 0
  });
  const pendingSelectionRef = useRef<SelectionRange | null>(null);
  const imageInsertSelectionRef = useRef<SelectionRange | null>(null);
  const shouldRestoreSelectionRef = useRef(false);
  const editorHintId = useId();
  const previewHeadingId = useId();
  const previewTitle = title.trim() || "Untitled note";
  const previewHtml = renderMarkdownToHtml(markdown);
  const isMobileViewport = !isDesktopViewport;
  const sourcePaneHidden = viewMode === "preview";
  const previewPaneHidden = viewMode !== "preview" && (isMobileViewport || viewMode === "source");
  const lineCount = markdown.split("\n").length;
  const wordCount = markdown.trim() ? markdown.trim().split(/\s+/).length : 0;
  const characterCount = markdown.length;
  const lineNumbers = Array.from({ length: lineCount }, (_, index) => index + 1);
  const workbenchBodyClassName = `note-editor-workbench-body note-editor-workbench-body-${viewMode}`;
  const toolbarHint = isDesktopViewport
    ? "Syntax-aware editing keeps the source visible and saves one markdown string."
    : "Edit in markdown, then switch to preview without compressing both panes onto the phone screen.";

  function runEditorAction(action: (currentMarkdown: string, selection: SelectionRange) => MarkdownEditResult) {
    const textarea = textareaRef.current;

    if (!textarea) {
      return;
    }

    const nextValue = action(markdown, {
      end: textarea.selectionEnd,
      start: textarea.selectionStart
    });

    updateMarkdown(nextValue.nextMarkdown, nextValue.nextSelection);
  }

  function syncEditorState(textarea: HTMLTextAreaElement) {
    setEditorScrollTop(textarea.scrollTop);
    selectionRef.current = {
      end: textarea.selectionEnd,
      start: textarea.selectionStart
    };
    setCursorState(getCursorState(markdown, textarea.selectionStart, textarea.selectionEnd));
  }

  function updateMarkdown(nextMarkdown: string, nextSelection?: SelectionRange) {
    markdownRef.current = nextMarkdown;
    setMarkdown(nextMarkdown);

    if (nextSelection) {
      selectionRef.current = nextSelection;
      pendingSelectionRef.current = nextSelection;
    }
  }

  function applyEditResult(result: MarkdownEditResult) {
    updateMarkdown(result.nextMarkdown, result.nextSelection);
  }

  function handleMarkdownChange(nextMarkdown: string) {
    markdownRef.current = nextMarkdown;
    setMarkdown(nextMarkdown);

    const textarea = textareaRef.current;

    if (textarea) {
      selectionRef.current = {
        end: textarea.selectionEnd,
        start: textarea.selectionStart
      };
      setCursorState(getCursorState(nextMarkdown, textarea.selectionStart, textarea.selectionEnd));
    }
  }

  function handleViewModeChange(nextMode: NoteEditorViewMode) {
    shouldRestoreSelectionRef.current = nextMode !== "preview";
    setViewMode(nextMode);
  }

  function triggerImagePicker() {
    if (isUploadingImage) {
      return;
    }

    const textarea = textareaRef.current;

    imageInsertSelectionRef.current = textarea
      ? {
          end: textarea.selectionEnd,
          start: textarea.selectionStart
        }
      : selectionRef.current;

    imageInputRef.current?.click();
  }

  async function handleImageUpload(file: File) {
    const uploadSelection = imageInsertSelectionRef.current ?? selectionRef.current;
    const formData = new FormData();

    formData.set("file", file);

    if (noteId) {
      formData.set("noteId", noteId);
    }

    setImageUploadError(null);
    setImageUploadNotice(null);
    setIsUploadingImage(true);

    try {
      const response = await fetch("/api/notes/images", {
        body: formData,
        method: "POST"
      });
      const payload = (await response.json()) as {
        alt?: string;
        error?: string;
        fileName?: string;
        url?: string;
      };

      if (!response.ok || !payload.url || !payload.alt) {
        throw new Error(payload.error || "Image upload failed.");
      }

      applyEditResult(
        insertMarkdownImage(markdownRef.current, uploadSelection, {
          alt: payload.alt,
          url: payload.url
        })
      );
      setImageUploadNotice(`Inserted ${payload.fileName ?? "image"} into the note body.`);
    } catch (error) {
      setImageUploadError(error instanceof Error ? error.message : "Image upload failed.");
    } finally {
      setIsUploadingImage(false);
      imageInsertSelectionRef.current = null;
    }
  }

  function handleEditorKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    const textarea = event.currentTarget;
    const selection = {
      end: textarea.selectionEnd,
      start: textarea.selectionStart
    };
    const hasShortcutModifier = event.metaKey || event.ctrlKey;
    const key = event.key.toLowerCase();

    if (hasShortcutModifier && !event.altKey && !event.shiftKey && key === "b") {
      event.preventDefault();
      applyEditResult(toggleInlineWrap(markdown, selection, "**"));
      return;
    }

    if (hasShortcutModifier && !event.altKey && !event.shiftKey && key === "i") {
      event.preventDefault();
      applyEditResult(toggleInlineWrap(markdown, selection, "*"));
      return;
    }

    if (hasShortcutModifier && !event.altKey && !event.shiftKey && key === "k") {
      event.preventDefault();
      applyEditResult(insertMarkdownLink(markdown, selection));
      return;
    }

    if (hasShortcutModifier && event.altKey && !event.shiftKey && key === "2") {
      event.preventDefault();
      applyEditResult(toggleHeading(markdown, selection, 2));
      return;
    }

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

    const nextValue = continueMarkdownStructure(markdown, selection);

    if (nextValue) {
      event.preventDefault();
      updateMarkdown(nextValue.nextMarkdown, nextValue.nextSelection);
    }
  }

  useLayoutEffect(() => {
    const nextSelection = pendingSelectionRef.current;
    const textarea = textareaRef.current;

    if (!nextSelection || !textarea) {
      return;
    }

    pendingSelectionRef.current = null;
    textarea.focus();
    textarea.setSelectionRange(nextSelection.start, nextSelection.end);
    setEditorScrollTop(textarea.scrollTop);
    selectionRef.current = {
      end: textarea.selectionEnd,
      start: textarea.selectionStart
    };
    setCursorState(getCursorState(markdown, textarea.selectionStart, textarea.selectionEnd));
  }, [markdown]);

  useLayoutEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia(desktopViewportQuery);

    const syncViewport = (matches: boolean, preserveDesktopSource = false) => {
      setIsDesktopViewport(matches);
      setViewMode((current) => getViewportSyncedViewMode(current, matches, preserveDesktopSource));
    };

    syncViewport(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      syncViewport(event.matches, true);
    };

    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  useEffect(() => {
    const textarea = textareaRef.current;

    if (!textarea) {
      return;
    }

    setEditorScrollTop(textarea.scrollTop);
    setCursorState(getCursorState(markdown, textarea.selectionStart, textarea.selectionEnd));
  }, [markdown]);

  useEffect(() => {
    if (!shouldRestoreSelectionRef.current || viewMode === "preview") {
      return;
    }

    const textarea = textareaRef.current;

    if (!textarea) {
      return;
    }

    shouldRestoreSelectionRef.current = false;
    textarea.focus();
    textarea.scrollTop = editorScrollTop;
    textarea.setSelectionRange(selectionRef.current.start, selectionRef.current.end);
    setEditorScrollTop(textarea.scrollTop);
    selectionRef.current = {
      end: textarea.selectionEnd,
      start: textarea.selectionStart
    };
    setCursorState(getCursorState(markdown, textarea.selectionStart, textarea.selectionEnd));
  }, [editorScrollTop, viewMode, markdown]);

  const toolbarActions = [
    {
      label: "H2",
      name: "Heading",
      run: (currentMarkdown: string, selection: SelectionRange) => toggleHeading(currentMarkdown, selection, 2),
      shortcut: "Ctrl/Cmd+Alt+2"
    },
    {
      label: "B",
      name: "Bold",
      run: (currentMarkdown: string, selection: SelectionRange) => toggleInlineWrap(currentMarkdown, selection, "**"),
      shortcut: "Ctrl/Cmd+B"
    },
    {
      label: "I",
      name: "Italic",
      run: (currentMarkdown: string, selection: SelectionRange) => toggleInlineWrap(currentMarkdown, selection, "*"),
      shortcut: "Ctrl/Cmd+I"
    },
    {
      label: "</>",
      name: "Code",
      run: (currentMarkdown: string, selection: SelectionRange) => toggleInlineWrap(currentMarkdown, selection, "`"),
      shortcut: "Selection"
    },
    {
      label: "-",
      name: "Bullet list",
      run: toggleBulletList,
      shortcut: "Lines"
    },
    {
      label: "1.",
      name: "Numbered list",
      run: toggleOrderedList,
      shortcut: "Lines"
    },
    {
      label: ">",
      name: "Quote",
      run: toggleBlockquote,
      shortcut: "Lines"
    },
    {
      label: "```",
      name: "Code block",
      run: toggleFencedCodeBlock,
      shortcut: "Selection"
    },
    {
      label: "[]",
      name: "Link",
      run: insertMarkdownLink,
      shortcut: "Ctrl/Cmd+K"
    }
  ];
  const viewModes: Array<{ desktopLabel: string; description: string; mobileLabel: string; value: NoteEditorViewMode }> = isDesktopViewport
    ? [
        {
          desktopLabel: "Source",
          description: "Raw editing only",
          mobileLabel: "Edit",
          value: "source"
        },
        {
          desktopLabel: "Split",
          description: "Draft with source and preview",
          mobileLabel: "Split",
          value: "split"
        },
        {
          desktopLabel: "Preview",
          description: "Preview review only",
          mobileLabel: "Preview",
          value: "preview"
        }
      ]
    : [
        {
          desktopLabel: "Source",
          description: "Markdown editing only",
          mobileLabel: "Edit",
          value: "source"
        },
        {
          desktopLabel: "Preview",
          description: "Rendered preview only",
          mobileLabel: "Preview",
          value: "preview"
        }
      ];

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
            <div
              className="note-editor-workbench"
              data-editor-workflow={isDesktopViewport ? "desktop" : "mobile"}
              data-testid="note-markdown-workbench"
            >
              <div className="note-editor-toolbar">
                <div className="note-editor-toolbar-header">
                  <div className="note-editor-toolbar-copy">
                    <strong>Markdown source</strong>
                    <span className="field-note" id={editorHintId}>
                      {toolbarHint}
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
                <div className="note-editor-toolbar-row">
                  <div aria-label="Markdown formatting toolbar" className="note-editor-toolbar-controls" data-testid="note-editor-toolbar" role="toolbar">
                    {toolbarActions.map((action) => (
                      <button
                        aria-label={`${action.name} markdown`}
                        className="note-editor-tool"
                        key={action.name}
                        onClick={() => runEditorAction(action.run)}
                        onMouseDown={(event) => event.preventDefault()}
                        title={`${action.name} (${action.shortcut})`}
                        type="button"
                      >
                        <span aria-hidden="true">{action.label}</span>
                      </button>
                    ))}
                    <button
                      aria-label="Image markdown"
                      className="note-editor-tool"
                      disabled={isUploadingImage}
                      onClick={triggerImagePicker}
                      onMouseDown={(event) => event.preventDefault()}
                      title={isUploadingImage ? "Uploading image" : "Upload image"}
                      type="button"
                    >
                      <span aria-hidden="true">{isUploadingImage ? "..." : "Img"}</span>
                    </button>
                  </div>
                  <div aria-label="Note editor view modes" className="note-editor-mode-switcher" data-testid="note-editor-mode-switcher" role="group">
                    {viewModes.map((mode) => (
                      <button
                        aria-pressed={viewMode === mode.value}
                        className={`note-editor-mode-toggle${viewMode === mode.value ? " note-editor-mode-toggle-active" : ""}`}
                        key={mode.value}
                        onClick={() => handleViewModeChange(mode.value)}
                        onMouseDown={(event) => event.preventDefault()}
                        title={mode.description}
                        type="button"
                      >
                        <span className="note-editor-mode-label-desktop">{mode.desktopLabel}</span>
                        <span className="note-editor-mode-label-mobile">{mode.mobileLabel}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className={workbenchBodyClassName} data-view-mode={viewMode}>
                <section
                  aria-hidden={sourcePaneHidden}
                  className={`note-editor-pane note-editor-pane-source${sourcePaneHidden ? " note-editor-pane-hidden" : ""}`}
                  data-testid="note-editor-source-pane"
                >
                  <div className="note-editor-surface">
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
                        placeholder={`# Start writing

Use headings, lists, quotes, links, and code without leaving markdown source.`}
                        ref={textareaRef}
                        spellCheck="true"
                        value={markdown}
                        wrap="soft"
                      />
                    </div>
                  </div>
                </section>

                <section
                  aria-hidden={previewPaneHidden}
                  aria-labelledby={previewHeadingId}
                  className={`note-editor-pane note-editor-pane-preview${previewPaneHidden ? " note-editor-pane-hidden" : ""}`}
                  data-testid="note-editor-preview-pane"
                >
                  <div className="note-editor-preview-frame">
                    <div className="note-editor-preview-head">
                      <div>
                        <strong>Preview</strong>
                        <span>Rendered from the same markdown source</span>
                      </div>
                      <span className="note-editor-preview-mode-note">
                        {viewMode === "preview" ? "Review mode" : "Live while drafting"}
                      </span>
                    </div>
                    <h2 id={previewHeadingId}>{previewTitle}</h2>
                    <div
                      className="markdown-preview"
                      data-testid="note-markdown-preview"
                      dangerouslySetInnerHTML={{
                        __html: previewHtml || "<p>Start writing to see the rendered preview.</p>"
                      }}
                    />
                  </div>
                </section>
              </div>
            </div>
            <input
              accept="image/png,image/jpeg,image/gif,image/webp"
              aria-label="Upload note image"
              className="sr-only"
              data-testid="note-image-upload-input"
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.currentTarget.value = "";

                if (!file) {
                  return;
                }

                void handleImageUpload(file);
              }}
              ref={imageInputRef}
              tabIndex={-1}
              type="file"
            />
            {imageUploadNotice ? <p className="status-note">{imageUploadNotice}</p> : null}
            {imageUploadError ? <p className="status-note status-note-error">{imageUploadError}</p> : null}
          </FormField>

          <div className="button-row">
            <SaveButton label={submitLabel} />
          </div>
        </Surface>
      </div>
    </div>
  );
}
