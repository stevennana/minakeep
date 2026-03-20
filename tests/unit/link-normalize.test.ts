import test from "node:test";
import assert from "node:assert/strict";

import { LinkValidationError, normalizeLinkInput } from "../../src/features/links/normalize";

test("normalizeLinkInput trims fields and canonicalizes the URL", () => {
  assert.deepEqual(
    normalizeLinkInput({
      url: " https://example.com/path ",
      title: " Example title "
    }),
    {
      url: "https://example.com/path",
      title: "Example title"
    }
  );
});

test("normalizeLinkInput rejects non-http schemes", () => {
  assert.throws(
    () =>
      normalizeLinkInput({
        url: "javascript:alert(1)",
        title: "Example title"
      }),
    (error) => error instanceof LinkValidationError && error.code === "invalid-url"
  );
});
