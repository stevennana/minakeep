import test from "node:test";
import assert from "node:assert/strict";

import { filterSafePublishedContent, sortPublishedContent, toPublishedPublicLink, toPublishedPublicNote } from "../../src/features/public-content/types";

test("toPublishedPublicNote and toPublishedPublicLink preserve the shared public boundary fields", () => {
  const publishedAt = new Date("2026-03-20T10:00:00.000Z");
  const updatedAt = new Date("2026-03-20T11:00:00.000Z");

  const note = toPublishedPublicNote({
    id: "note-1",
    title: "Published note",
    slug: "published-note",
    excerpt: "Note excerpt",
    cardImage: null,
    summary: "Note summary",
    publishedAt,
    updatedAt,
    tags: [{ id: "tag-1", name: "notes" }]
  });

  const link = toPublishedPublicLink({
    id: "link-1",
    title: "Published link",
    url: "https://example.com/published-link",
    summary: "Link summary",
    faviconAssetId: "favicon-1",
    publishedAt,
    updatedAt,
    tags: [{ id: "tag-2", name: "links" }]
  });

  assert.deepEqual(
    {
      kind: note.kind,
      title: note.title,
      summary: note.summary,
      publishedAt: note.publishedAt,
      updatedAt: note.updatedAt,
      tags: note.tags,
      cardImage: note.cardImage,
      slug: note.slug,
      excerpt: note.excerpt
    },
    {
      kind: "note",
      title: "Published note",
      summary: "Note summary",
      publishedAt,
      updatedAt,
      tags: [{ id: "tag-1", name: "notes" }],
      cardImage: null,
      slug: "published-note",
      excerpt: "Note excerpt"
    }
  );

  assert.deepEqual(
    {
      kind: link.kind,
      title: link.title,
      summary: link.summary,
      publishedAt: link.publishedAt,
      updatedAt: link.updatedAt,
      tags: link.tags,
      faviconAssetId: link.faviconAssetId,
      url: link.url
    },
    {
      kind: "link",
      title: "Published link",
      summary: "Link summary",
      publishedAt,
      updatedAt,
      tags: [{ id: "tag-2", name: "links" }],
      faviconAssetId: "favicon-1",
      url: "https://example.com/published-link"
    }
  );
});

test("sortPublishedContent orders mixed published items by published time, then updated time, then title", () => {
  const sorted = sortPublishedContent([
    {
      id: "link-b",
      kind: "link",
      title: "Zulu reference",
      summary: null,
      faviconAssetId: null,
      publishedAt: new Date("2026-03-20T09:00:00.000Z"),
      updatedAt: new Date("2026-03-20T09:05:00.000Z"),
      tags: [],
      url: "https://example.com/zulu"
    },
    {
      id: "note-a",
      kind: "note",
      title: "Alpha note",
      summary: null,
      publishedAt: new Date("2026-03-20T09:00:00.000Z"),
      updatedAt: new Date("2026-03-20T09:05:00.000Z"),
      tags: [],
      cardImage: null,
      slug: "alpha-note",
      excerpt: "Alpha excerpt"
    },
    {
      id: "note-newest",
      kind: "note",
      title: "Newest note",
      summary: null,
      publishedAt: new Date("2026-03-21T09:00:00.000Z"),
      updatedAt: new Date("2026-03-21T09:00:00.000Z"),
      tags: [],
      cardImage: null,
      slug: "newest-note",
      excerpt: "Newest excerpt"
    },
    {
      id: "link-mid",
      kind: "link",
      title: "Middle link",
      summary: null,
      faviconAssetId: null,
      publishedAt: new Date("2026-03-20T09:00:00.000Z"),
      updatedAt: new Date("2026-03-20T10:05:00.000Z"),
      tags: [],
      url: "https://example.com/middle"
    }
  ]);

  assert.deepEqual(
    sorted.map((item) => item.id),
    ["note-newest", "link-mid", "note-a", "link-b"]
  );
});

test("filterSafePublishedContent drops unsafe or malformed published links while keeping notes and safe links", () => {
  const filtered = filterSafePublishedContent([
    {
      id: "note-safe",
      kind: "note",
      title: "Safe note",
      summary: null,
      publishedAt: new Date("2026-03-21T09:00:00.000Z"),
      updatedAt: new Date("2026-03-21T09:00:00.000Z"),
      tags: [],
      cardImage: null,
      slug: "safe-note",
      excerpt: "Safe excerpt"
    },
    {
      id: "link-safe",
      kind: "link",
      title: "Safe link",
      summary: null,
      faviconAssetId: null,
      publishedAt: new Date("2026-03-21T08:00:00.000Z"),
      updatedAt: new Date("2026-03-21T08:00:00.000Z"),
      tags: [],
      url: "https://example.com/safe-link"
    },
    {
      id: "link-unsafe",
      kind: "link",
      title: "Unsafe link",
      summary: null,
      faviconAssetId: null,
      publishedAt: new Date("2026-03-21T07:00:00.000Z"),
      updatedAt: new Date("2026-03-21T07:00:00.000Z"),
      tags: [],
      url: "javascript:alert('xss')"
    },
    {
      id: "link-malformed",
      kind: "link",
      title: "Malformed link",
      summary: null,
      faviconAssetId: null,
      publishedAt: new Date("2026-03-21T06:00:00.000Z"),
      updatedAt: new Date("2026-03-21T06:00:00.000Z"),
      tags: [],
      url: "not a url"
    }
  ]);

  assert.deepEqual(
    filtered.map((item) => item.id),
    ["note-safe", "link-safe"]
  );
});
