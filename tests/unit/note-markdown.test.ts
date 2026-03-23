import assert from "node:assert/strict";
import test from "node:test";

import { createNoteExcerpt, renderMarkdownToHtml } from "../../src/features/notes/markdown";

test("renderMarkdownToHtml preserves common note-writing structures while escaping unsafe HTML", () => {
  const html = renderMarkdownToHtml(`# Heading

- first item
- second item with [link](https://example.com)

![Desk shot](/media/image-1)

Paragraph with **bold** text and <script>alert(1)</script>.
`);

  assert.match(html, /<h1>Heading<\/h1>/);
  assert.match(html, /<ul><li>first item<\/li><li>second item with <a href="https:\/\/example.com\/"/);
  assert.match(html, /<img alt="Desk shot" loading="lazy" src="\/media\/image-1" \/>/);
  assert.match(html, /<strong>bold<\/strong>/);
  assert.match(html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
});

test("renderMarkdownToHtml renders markdown tables as semantic table markup", () => {
  const html = renderMarkdownToHtml(`| Feature | Deer-Flow | LangChain |
| --- | --- | --- |
| Purpose | Workflow engine | LLM framework |
| Focus | Pipeline orchestration | Prompt & LLM chaining |`);

  assert.match(html, /<table><thead><tr><th>Feature<\/th><th>Deer-Flow<\/th><th>LangChain<\/th><\/tr><\/thead><tbody>/);
  assert.match(html, /<td>Workflow engine<\/td>/);
  assert.match(html, /<td>Prompt &amp; LLM chaining<\/td>/);
});

test("createNoteExcerpt turns markdown into readable summary text", () => {
  const excerpt = createNoteExcerpt("## Draft note\n\n![Desk shot](/media/image-1)\n\nThis is a private note with `inline code`.", "Fallback title");

  assert.equal(excerpt, "Draft note Desk shot This is a private note with inline code.");
});

test("createNoteExcerpt strips markdown table separators into readable text", () => {
  const excerpt = createNoteExcerpt(`| Feature | Deer-Flow | LangChain |
| --- | --- | --- |
| Purpose | Workflow engine | LLM framework |`, "Fallback title");

  assert.equal(excerpt, "Feature Deer Flow LangChain Purpose Workflow engine LLM framework");
});
