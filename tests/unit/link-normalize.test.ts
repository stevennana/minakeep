import test from "node:test";
import assert from "node:assert/strict";

import { LinkValidationError, normalizeLinkInput } from "../../src/features/links/normalize";
import { normalizeTagNames } from "../../src/features/tags/normalize";

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

test("normalizeLinkInput rejects non-http schemes", () => {
  assert.throws(
    () =>
      normalizeLinkInput({
        url: "javascript:alert(1)",
        title: "Example title",
        summary: "Helpful reference",
        tags: ""
      }),
    (error) => error instanceof LinkValidationError && error.code === "invalid-url"
  );
});
