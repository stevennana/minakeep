import assert from "node:assert/strict";
import test from "node:test";

import { getMediaAssetPath, isMediaAssetPubliclyVisible, resolveMediaAssetAccess } from "../../src/features/media/types";

test("note images are public only when the linked note is published and references the server-backed media path", () => {
  const assetId = "note-image-1";

  assert.equal(
    isMediaAssetPubliclyVisible({
      id: assetId,
      ownerId: "owner-1",
      kind: "note-image",
      storageKey: "note-images/note-1/note-image-1.svg",
      contentType: "image/svg+xml",
      sizeBytes: 128,
      note: {
        isPublished: true,
        markdown: `![Preview](${getMediaAssetPath(assetId)})`
      },
      link: null
    }),
    true
  );

  assert.equal(
    isMediaAssetPubliclyVisible({
      id: assetId,
      ownerId: "owner-1",
      kind: "note-image",
      storageKey: "note-images/note-1/note-image-1.svg",
      contentType: "image/svg+xml",
      sizeBytes: 128,
      note: {
        isPublished: true,
        markdown: "No image reference here."
      },
      link: null
    }),
    false
  );

  assert.equal(
    isMediaAssetPubliclyVisible({
      id: assetId,
      ownerId: "owner-1",
      kind: "note-image",
      storageKey: "note-images/note-1/note-image-1.svg",
      contentType: "image/svg+xml",
      sizeBytes: 128,
      note: {
        isPublished: false,
        markdown: `![Preview](${getMediaAssetPath(assetId)})`
      },
      link: null
    }),
    false
  );
});

test("link favicons become public only with a published link, while the owner can always access their own media", () => {
  const asset = {
    id: "favicon-1",
    ownerId: "owner-1",
    kind: "link-favicon" as const,
    storageKey: "favicons/link-1/favicon-1.svg",
    contentType: "image/svg+xml",
    sizeBytes: 64,
    note: null,
    link: {
      isPublished: false
    }
  };

  assert.equal(isMediaAssetPubliclyVisible(asset), false);
  assert.equal(resolveMediaAssetAccess(asset, null), null);
  assert.equal(resolveMediaAssetAccess(asset, "owner-1"), "owner");
  assert.equal(
    resolveMediaAssetAccess(
      {
        ...asset,
        link: {
          isPublished: true
        }
      },
      null
    ),
    "public"
  );
});
