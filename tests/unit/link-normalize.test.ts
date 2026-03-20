import test from "node:test";
import assert from "node:assert/strict";

import { normalizeLinkInput, normalizeTagNames } from "../../src/features/links/normalize";

test("normalizeTagNames trims, deduplicates, and lowercases shared tags", () => {
  assert.deepEqual(normalizeTagNames(" Research, inbox\nresearch, Reading "), ["inbox", "reading", "research"]);
});

test("normalizeLinkInput trims fields and canonicalizes the URL", () => {
  assert.deepEqual(
    normalizeLinkInput({
      url: " https://example.com/path ",
      title: " Example title ",
      summary: " Helpful reference ",
      tags: "Docs, docs"
    }),
    {
      url: "https://example.com/path",
      title: "Example title",
      summary: "Helpful reference",
      tagNames: ["docs"]
    }
  );
});
