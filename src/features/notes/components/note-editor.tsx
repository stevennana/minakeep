"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";

import { renderMarkdownToHtml } from "@/features/notes/markdown";

type NoteEditorProps = {
  initialTitle: string;
  initialMarkdown: string;
  action: (formData: FormData) => void | Promise<void>;
  formTitle: string;
  formDescription: string;
  submitLabel: string;
  savedNotice?: string;
};

function SaveButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <button className="primary-button" type="submit">
      {pending ? "Saving..." : label}
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
  savedNotice
}: NoteEditorProps) {
  const [title, setTitle] = useState(initialTitle);
  const [markdown, setMarkdown] = useState(initialMarkdown);
  const previewTitle = title.trim() || "Untitled note";
  const previewHtml = renderMarkdownToHtml(markdown);

  return (
    <div className="note-editor-shell">
      <section className="panel-card note-editor-intro">
        <p className="eyebrow">Private note authoring</p>
        <h1>{formTitle}</h1>
        <p className="lede">{formDescription}</p>
        {savedNotice ? <p className="status-note">{savedNotice}</p> : null}
      </section>

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
