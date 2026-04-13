import assert from "node:assert/strict";
import test from "node:test";

import { renderMermaidShell } from "../../src/features/notes/mermaid";
import { createNoteExcerpt, renderMarkdown, renderMarkdownToHtml } from "../../src/features/notes/markdown";

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

test("renderMarkdownToHtml turns supported mermaid fences into the shared library render contract", () => {
  const markdown = `# Diagram

\`\`\`mermaid
flowchart TD
  subgraph Studio[Owner studio]
    A[Start] --> B{Ship it?}
  end
  B -->|yes| C[Done]
  classDef accent fill:#dbeafe,stroke:#2563eb,color:#0f172a
  class C accent
  style B fill:#fef3c7,stroke:#d97706,stroke-width:2px,color:#7c2d12
  linkStyle 1 stroke:#2563eb,stroke-width:3px,color:#1d4ed8
\`\`\``;
  const html = renderMarkdownToHtml(markdown);

  assert.match(html, /markdown-mermaid markdown-mermaid--pending/);
  assert.match(
    html,
    /data-mermaid-source="flowchart%20TD%0A%20%20subgraph%20Studio%5BOwner%20studio%5D%0A%20%20%20%20A%5BStart%5D%20--%3E%20B%7BShip%20it%3F%7D%0A%20%20end%0A%20%20B%20--%3E%7Cyes%7C%20C%5BDone%5D%0A%20%20classDef%20accent%20fill%3A%23dbeafe%2Cstroke%3A%232563eb%2Ccolor%3A%230f172a%0A%20%20class%20C%20accent%0A%20%20style%20B%20fill%3A%23fef3c7%2Cstroke%3A%23d97706%2Cstroke-width%3A2px%2Ccolor%3A%237c2d12%0A%20%20linkStyle%201%20stroke%3A%232563eb%2Cstroke-width%3A3px%2Ccolor%3A%231d4ed8"/
  );
  assert.match(html, /Diagram preview loading/);
  assert.match(html, /Rendering Mermaid diagram from the saved markdown source\./);
  assert.match(html, /flowchart TD/);
  assert.match(html, /subgraph Studio\[Owner studio\]/);
  assert.match(html, /classDef accent fill:#dbeafe,stroke:#2563eb,color:#0f172a/);
  assert.match(html, /style B fill:#fef3c7,stroke:#d97706,stroke-width:2px,color:#7c2d12/);
  assert.doesNotMatch(html, /```mermaid/);
});

test("renderMarkdown collects supported reference links into first-use order and removes definitions from the article body", () => {
  const rendered = renderMarkdown(`Paragraph with [^beta] before [^alpha].

Another mention of [^beta].

[^alpha]: [Alpha source](https://example.com/alpha)
[^beta]: [Beta source](https://example.com/beta)`);

  assert.match(rendered.articleHtml, /Paragraph with <sup class="markdown-reference-marker"><a aria-label="Reference 1" href="#markdown-reference-beta">\[1\]<\/a><\/sup> before <sup class="markdown-reference-marker"><a aria-label="Reference 2" href="#markdown-reference-alpha">\[2\]<\/a><\/sup>\./);
  assert.equal(rendered.references.length, 2);
  assert.deepEqual(
    rendered.references.map((reference) => ({
      entryId: reference.entryId,
      index: reference.index,
      label: reference.label,
      title: reference.title,
      url: reference.url
    })),
    [
      {
        entryId: "markdown-reference-beta",
        index: 1,
        label: "beta",
        title: "Beta source",
        url: "https://example.com/beta"
      },
      {
        entryId: "markdown-reference-alpha",
        index: 2,
        label: "alpha",
        title: "Alpha source",
        url: "https://example.com/alpha"
      }
    ]
  );
  assert.doesNotMatch(rendered.articleHtml, /\[\^alpha\]:/);
  assert.doesNotMatch(rendered.articleHtml, /\[\^beta\]:/);
});

test("renderMarkdown reuses one extracted reference entry when the same label appears multiple times", () => {
  const rendered = renderMarkdown(`Repeated [^same] markers stay stable.

Again [^same].

[^same]: [One source](https://example.com/source)`);

  assert.equal(rendered.references.length, 1);
  assert.equal(rendered.references[0]?.index, 1);
  assert.match(rendered.articleHtml, /\[1\]<\/a><\/sup> markers stay stable\./);
  assert.equal(rendered.articleHtml.match(/href="#markdown-reference-same"/g)?.length, 2);
});

test("renderMarkdown keeps malformed reference syntax visible and sanitizes unsafe supported URLs", () => {
  const rendered = renderMarkdown(`Malformed [^missing] stays readable.

[^missing]: not a supported definition
[^unsafe]: [Unsafe source](javascript:alert)

Supported [^unsafe] still renders safely.`);

  assert.match(rendered.articleHtml, /Malformed \[\^missing\] stays readable\./);
  assert.match(rendered.articleHtml, /\[\^missing\]: not a supported definition/);
  assert.equal(rendered.references.length, 1);
  assert.equal(rendered.references[0]?.url, "#");
  assert.match(rendered.articleHtml, /Supported <sup class="markdown-reference-marker"><a aria-label="Reference 1" href="#markdown-reference-unsafe">\[1\]<\/a><\/sup> still renders safely\./);
});

test("renderMermaidShell returns sanitized SVG markup when the library render succeeds", async () => {
  const result = await renderMermaidShell("flowchart TD\nA-->B", async () =>
    `<svg class="flowchart" onclick="alert(1)" xmlns="http://www.w3.org/2000/svg"><style>.accent{fill:#dbeafe;stroke:#2563eb;}.accent-text{fill:#0f172a;}</style><script>alert(1)</script><g class="cluster accent"><text class="accent-text">Hello</text></g></svg>`
  );

  assert.equal(result.state, "rendered");
  assert.match(result.markup, /<svg class="flowchart markdown-mermaid-svg"/);
  assert.match(result.markup, /aria-label="Rendered Mermaid diagram"/);
  assert.match(result.markup, /<style>\.accent\{fill:#dbeafe;stroke:#2563eb;\}\.accent-text\{fill:#0f172a;\}<\/style>/);
  assert.match(result.markup, /class="cluster accent"/);
  assert.match(result.markup, />Hello</);
  assert.doesNotMatch(result.markup, /<script/);
  assert.doesNotMatch(result.markup, /onclick=/);
});

test("renderMarkdownToHtml keeps supported sequence mermaid fences on the shared render path", () => {
  const html = renderMarkdownToHtml(`\`\`\`mermaid
sequenceDiagram
  participant A as Alice
  participant B as Bob
  A->>B: hello
  B-->>A: shipped
\`\`\``);

  assert.match(html, /markdown-mermaid markdown-mermaid--pending/);
  assert.match(html, /data-mermaid-source="sequenceDiagram%0A%20%20participant%20A%20as%20Alice%0A%20%20participant%20B%20as%20Bob%0A%20%20A-%3E%3EB%3A%20hello%0A%20%20B--%3E%3EA%3A%20shipped"/);
  assert.match(html, /A-&gt;&gt;B: hello/);
  assert.match(html, /B--&gt;&gt;A: shipped/);
});

test("renderMarkdownToHtml keeps supported class mermaid fences on the shared render path", () => {
  const html = renderMarkdownToHtml(`\`\`\`mermaid
classDiagram
  class Note {
    +String title
    +publish()
  }
  class PublicArchive {
    +render()
  }
  Note --> PublicArchive : ships to
\`\`\``);

  assert.match(html, /markdown-mermaid markdown-mermaid--pending/);
  assert.match(
    html,
    /data-mermaid-source="classDiagram%0A%20%20class%20Note%20%7B%0A%20%20%20%20%2BString%20title%0A%20%20%20%20%2Bpublish\(\)%0A%20%20%7D%0A%20%20class%20PublicArchive%20%7B%0A%20%20%20%20%2Brender\(\)%0A%20%20%7D%0A%20%20Note%20--%3E%20PublicArchive%20%3A%20ships%20to"/
  );
  assert.match(html, /classDiagram/);
  assert.match(html, /\.\.\. \+1 more line\(s\)/);
});

test("renderMarkdownToHtml keeps supported state mermaid fences on the shared render path", () => {
  const html = renderMarkdownToHtml(`\`\`\`mermaid
stateDiagram-v2
  [*] --> Draft
  Draft --> Review: save
  Review --> Published: publish
\`\`\``);

  assert.match(html, /markdown-mermaid markdown-mermaid--pending/);
  assert.match(
    html,
    /data-mermaid-source="stateDiagram-v2%0A%20%20%5B\*%5D%20--%3E%20Draft%0A%20%20Draft%20--%3E%20Review%3A%20save%0A%20%20Review%20--%3E%20Published%3A%20publish"/
  );
  assert.match(html, /stateDiagram-v2/);
  assert.match(html, /Draft --&gt; Review: save/);
});

test("renderMarkdownToHtml falls back for unsupported mermaid roots instead of claiming a rendered diagram", () => {
  const html = renderMarkdownToHtml(`\`\`\`mermaid
gantt
  title Release train
\`\`\``);

  assert.match(html, /markdown-mermaid markdown-mermaid--fallback/);
  assert.match(html, /Diagram preview unavailable/);
  assert.doesNotMatch(html, /markdown-mermaid markdown-mermaid--rendered/);
  assert.doesNotMatch(html, /data-mermaid-source=/);
});

test("renderMermaidShell falls back cleanly when the library render rejects malformed input", async () => {
  const result = await renderMermaidShell("sequenceDiagram\nAlice hello Bob", async () => {
    throw new Error("Parse error");
  });

  assert.equal(result.state, "fallback");
  assert.match(result.markup, /Diagram preview unavailable/);
  assert.match(result.markup, /Alice hello Bob/);
  assert.doesNotMatch(result.markup, /<svg/);
});

test("renderMermaidShell falls back cleanly when malformed class diagrams fail inside the supported root set", async () => {
  const result = await renderMermaidShell("classDiagram\nThis is not valid Mermaid source.", async () => {
    throw new Error("Parse error");
  });

  assert.equal(result.state, "fallback");
  assert.match(result.markup, /Diagram preview unavailable/);
  assert.match(result.markup, /classDiagram/);
  assert.match(result.markup, /This is not valid Mermaid source\./);
  assert.doesNotMatch(result.markup, /<svg/);
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
