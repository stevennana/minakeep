import assert from "node:assert/strict";
import test from "node:test";

import {
  continueMarkdownStructure,
  getViewportSyncedViewMode,
  indentSelectedLines,
  insertBlockMath,
  insertInlineMath,
  insertMarkdownImage,
  insertMarkdownLink,
  toggleBlockquote,
  toggleBulletList,
  toggleFencedCodeBlock,
  toggleHeading,
  toggleInlineWrap,
  toggleOrderedList,
  type SelectionRange
} from "../../src/features/notes/editor-markdown";

function selectAll(markdown: string): SelectionRange {
  return {
    end: markdown.length,
    start: 0
  };
}

test("inline markdown transforms stay reversible without introducing a second document model", () => {
  const wrapped = toggleInlineWrap("alpha", { end: 5, start: 0 }, "**");
  assert.equal(wrapped.nextMarkdown, "**alpha**");
  assert.deepEqual(wrapped.nextSelection, { end: 7, start: 2 });

  const unwrapped = toggleInlineWrap(wrapped.nextMarkdown, wrapped.nextSelection, "**");
  assert.equal(unwrapped.nextMarkdown, "alpha");
  assert.deepEqual(unwrapped.nextSelection, { end: 5, start: 0 });

  const linked = insertMarkdownLink("gamma", { end: 5, start: 0 });
  assert.equal(linked.nextMarkdown, "[gamma](https://)");
  assert.deepEqual(linked.nextSelection, { end: 16, start: 8 });

  const unlinked = insertMarkdownLink(linked.nextMarkdown, selectAll(linked.nextMarkdown));
  assert.equal(unlinked.nextMarkdown, "gamma");
  assert.deepEqual(unlinked.nextSelection, { end: 5, start: 0 });

  const imageInserted = insertMarkdownImage("Alpha paragraph", { end: 15, start: 15 }, { alt: "Desk shot", url: "/media/asset-1" });
  assert.equal(imageInserted.nextMarkdown, "Alpha paragraph\n\n![Desk shot](/media/asset-1)");
  assert.deepEqual(imageInserted.nextSelection, { end: 45, start: 45 });
});

test("math helpers keep note authoring markdown-native", () => {
  const inlineMath = insertInlineMath("mass", { end: 4, start: 0 });
  assert.equal(inlineMath.nextMarkdown, "$mass$");
  assert.deepEqual(inlineMath.nextSelection, { end: 5, start: 1 });

  const inlineEmpty = insertInlineMath("", { end: 0, start: 0 });
  assert.equal(inlineEmpty.nextMarkdown, "$$");
  assert.deepEqual(inlineEmpty.nextSelection, { end: 1, start: 1 });

  const inlineReset = insertInlineMath(inlineMath.nextMarkdown, inlineMath.nextSelection);
  assert.equal(inlineReset.nextMarkdown, "mass");
  assert.deepEqual(inlineReset.nextSelection, { end: 4, start: 0 });

  const blockMath = insertBlockMath("x^2 + y^2", selectAll("x^2 + y^2"));
  assert.equal(blockMath.nextMarkdown, "$$\nx^2 + y^2\n$$");
  assert.deepEqual(blockMath.nextSelection, { end: 12, start: 3 });

  const emptyBlockMath = insertBlockMath("", { end: 0, start: 0 });
  assert.equal(emptyBlockMath.nextMarkdown, "$$\n\n$$");
  assert.deepEqual(emptyBlockMath.nextSelection, { end: 3, start: 3 });
});

test("line-oriented toolbar transforms add and remove markdown markers predictably", () => {
  const heading = toggleHeading("section", { end: 7, start: 0 }, 2);
  assert.equal(heading.nextMarkdown, "## section");

  const headingReset = toggleHeading(heading.nextMarkdown, selectAll(heading.nextMarkdown), 2);
  assert.equal(headingReset.nextMarkdown, "section");

  const bullets = toggleBulletList("one\ntwo", selectAll("one\ntwo"));
  assert.equal(bullets.nextMarkdown, "- one\n- two");

  const bulletsReset = toggleBulletList(bullets.nextMarkdown, selectAll(bullets.nextMarkdown));
  assert.equal(bulletsReset.nextMarkdown, "one\ntwo");

  const ordered = toggleOrderedList("first\nsecond", selectAll("first\nsecond"));
  assert.equal(ordered.nextMarkdown, "1. first\n2. second");

  const orderedReset = toggleOrderedList(ordered.nextMarkdown, selectAll(ordered.nextMarkdown));
  assert.equal(orderedReset.nextMarkdown, "first\nsecond");

  const quote = toggleBlockquote("quoted text", selectAll("quoted text"));
  assert.equal(quote.nextMarkdown, "> quoted text");

  const quoteReset = toggleBlockquote(quote.nextMarkdown, selectAll(quote.nextMarkdown));
  assert.equal(quoteReset.nextMarkdown, "quoted text");

  const fenced = toggleFencedCodeBlock("const total = 1;", selectAll("const total = 1;"));
  assert.equal(fenced.nextMarkdown, "```\nconst total = 1;\n```");

  const fencedReset = toggleFencedCodeBlock(fenced.nextMarkdown, selectAll(fenced.nextMarkdown));
  assert.equal(fencedReset.nextMarkdown, "const total = 1;");
});

test("tab indentation stays markdown-native for both indent and outdent flows", () => {
  const indented = indentSelectedLines("- one\n- two", selectAll("- one\n- two"));
  assert.equal(indented.nextMarkdown, "  - one\n  - two");

  const outdented = indentSelectedLines(indented.nextMarkdown, selectAll(indented.nextMarkdown), true);
  assert.equal(outdented.nextMarkdown, "- one\n- two");

  const tabIndented = indentSelectedLines("\tquoted", selectAll("\tquoted"), true);
  assert.equal(tabIndented.nextMarkdown, "quoted");
});

test("enter continuation keeps list and quote flows deterministic instead of rewriting markdown", () => {
  const ordered = continueMarkdownStructure("1. first", { end: 8, start: 8 });
  assert.ok(ordered);
  assert.equal(ordered.nextMarkdown, "1. first\n2. ");

  const orderedExit = continueMarkdownStructure("1. ", { end: 3, start: 3 });
  assert.ok(orderedExit);
  assert.equal(orderedExit.nextMarkdown, "1. \n");

  const bullet = continueMarkdownStructure("- item", { end: 6, start: 6 });
  assert.ok(bullet);
  assert.equal(bullet.nextMarkdown, "- item\n- ");

  const quote = continueMarkdownStructure("> quote", { end: 7, start: 7 });
  assert.ok(quote);
  assert.equal(quote.nextMarkdown, "> quote\n> ");

  const midLine = continueMarkdownStructure("plain text", { end: 5, start: 5 });
  assert.equal(midLine, null);
});

test("viewport mode syncing preserves the shipped desktop and mobile workbench rules", () => {
  assert.equal(getViewportSyncedViewMode("source", true), "split");
  assert.equal(getViewportSyncedViewMode("split", false), "source");
  assert.equal(getViewportSyncedViewMode("source", true, true), "source");
  assert.equal(getViewportSyncedViewMode("preview", true, true), "preview");
});
