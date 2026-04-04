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

test("renderMarkdownToHtml renders inline and block LaTeX math for note preview and public reading", () => {
  const html = renderMarkdownToHtml(`Euler wrote $e^{i\\pi} + 1 = 0$ in the margin.

$$
\\int_0^1 x^2 \\, dx
$$`);

  assert.match(html, /markdown-math-inline/);
  assert.match(html, /class="katex"/);
  assert.ok(html.includes(String.raw`annotation encoding="application/x-tex">e^{i\pi} + 1 = 0</annotation>`));
  assert.match(html, /markdown-math-block/);
  assert.ok(html.includes(String.raw`annotation encoding="application/x-tex">\int_0^1 x^2 \, dx</annotation>`));
});

test("renderMarkdownToHtml keeps fenced code literal even when it contains math delimiters", () => {
  const html = renderMarkdownToHtml("```\nconst sample = '$not-math$';\n```");

  assert.doesNotMatch(html, /class="katex"/);
  assert.match(html, /&apos;\$not-math\$&apos;|&#39;\$not-math\$&#39;/);
});

test("renderMarkdownToHtml turns valid mermaid fences into sanitized static diagram markup", () => {
  const markdown = `# Diagram

\`\`\`mermaid
flowchart TD
  A[Start] --> B{Ship it?}
  B -->|yes| C[Done]
\`\`\``;
  const html = renderMarkdownToHtml(markdown);

  assert.match(html, /markdown-mermaid markdown-mermaid--rendered/);
  assert.match(html, /<svg class="markdown-mermaid-svg"/);
  assert.match(html, /aria-label="Rendered Mermaid diagram"/);
  assert.match(html, /class="markdown-mermaid-node"/);
  assert.match(html, /class="markdown-mermaid-edge__path"/);
  assert.match(html, />Start</);
  assert.match(html, />Ship it\?</);
  assert.match(html, />Done</);
  assert.match(html, />yes</);
  assert.doesNotMatch(html, /markdown-mermaid-svg__line/);
  assert.doesNotMatch(html, /flowchart TD/);
  assert.doesNotMatch(html, /```mermaid/);
});

test("renderMarkdownToHtml renders supported sequence mermaid fences with semantic SVG content", () => {
  const html = renderMarkdownToHtml(`\`\`\`mermaid
sequenceDiagram
  participant A as Alice
  participant B as Bob
  Alice->>Bob: hello
  Bob-->>Alice: shipped
\`\`\``);

  assert.match(html, /markdown-mermaid markdown-mermaid--rendered/);
  assert.match(html, /markdown-mermaid-svg markdown-mermaid-svg--sequence/);
  assert.match(html, /class="markdown-mermaid-sequence__participant"/);
  assert.match(html, /class="markdown-mermaid-sequence__message-line"/);
  assert.match(html, />Alice</);
  assert.match(html, />Bob</);
  assert.match(html, />hello</);
  assert.match(html, />shipped</);
  assert.doesNotMatch(html, /markdown-mermaid markdown-mermaid--fallback/);
  assert.doesNotMatch(html, /Alice-&gt;&gt;Bob: hello/);
});

test("renderMarkdownToHtml falls back for unsupported mermaid roots instead of claiming a rendered diagram", () => {
  const html = renderMarkdownToHtml(`\`\`\`mermaid
gantt
  title Release train
\`\`\``);

  assert.match(html, /markdown-mermaid markdown-mermaid--fallback/);
  assert.match(html, /Diagram preview unavailable/);
  assert.doesNotMatch(html, /markdown-mermaid markdown-mermaid--rendered/);
});

test("renderMarkdownToHtml falls back cleanly for invalid mermaid fences", () => {
  const html = renderMarkdownToHtml(`\`\`\`mermaid
flowchart TD
  A[Start --> B[Broken
\`\`\``);

  assert.match(html, /markdown-mermaid markdown-mermaid--fallback/);
  assert.match(html, /Diagram preview unavailable/);
  assert.match(html, /A\[Start --&gt; B\[Broken/);
  assert.doesNotMatch(html, /aria-label="Rendered Mermaid diagram"/);
});

test("renderMarkdownToHtml falls back for malformed supported sequence diagrams", () => {
  const html = renderMarkdownToHtml(`\`\`\`mermaid
sequenceDiagram
  Alice hello Bob
\`\`\``);

  assert.match(html, /markdown-mermaid markdown-mermaid--fallback/);
  assert.match(html, /Alice hello Bob/);
  assert.doesNotMatch(html, /markdown-mermaid-svg markdown-mermaid-svg--sequence/);
});

test("renderMarkdownToHtml does not rewrite the authored mermaid fence source", () => {
  const markdown = `\`\`\`mermaid
sequenceDiagram
  Alice->>Bob: hello
\`\`\``;

  renderMarkdownToHtml(markdown);

  assert.equal(
    markdown,
    `\`\`\`mermaid
sequenceDiagram
  Alice->>Bob: hello
\`\`\``
  );
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

test("createNoteExcerpt strips math delimiters into readable summary text", () => {
  const excerpt = createNoteExcerpt("We keep $e^{i\\pi} + 1 = 0$ visible.\n\n$$\\int_0^1 x^2 \\, dx$$", "Fallback title");

  assert.equal(excerpt, String.raw`We keep e^{i\pi} + 1 = 0 visible. \int 0^1 x^2 \, dx`);
});
