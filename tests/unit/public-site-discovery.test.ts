import assert from "node:assert/strict";
import test from "node:test";

import { type PublishedPublicContent } from "../../src/features/public-content/types";
import { PUBLIC_SITE_ORIGIN_ENV_KEY } from "../../src/features/public-site/config";
import { buildPublicSitemap, getPublicRobots } from "../../src/features/public-site/discovery";

function withSiteUrl(value: string | undefined, callback: () => void | Promise<void>) {
  const original = process.env[PUBLIC_SITE_ORIGIN_ENV_KEY];

  if (value === undefined) {
    delete process.env[PUBLIC_SITE_ORIGIN_ENV_KEY];
  } else {
    process.env[PUBLIC_SITE_ORIGIN_ENV_KEY] = value;
  }

  return Promise.resolve(callback()).finally(() => {
    if (original === undefined) {
      delete process.env[PUBLIC_SITE_ORIGIN_ENV_KEY];
      return;
    }

    process.env[PUBLIC_SITE_ORIGIN_ENV_KEY] = original;
  });
}

function createPublishedNote(overrides?: Partial<Extract<PublishedPublicContent, { kind: "note" }>>): Extract<PublishedPublicContent, { kind: "note" }> {
  return {
    id: "note-1",
    kind: "note",
    title: "Published note",
    summary: "Summary",
    publishedAt: new Date("2026-03-21T10:00:00.000Z"),
    updatedAt: new Date("2026-03-21T11:00:00.000Z"),
    tags: [],
    cardImage: null,
    excerpt: "Excerpt",
    slug: "published-note",
    ...overrides
  };
}

function createPublishedLink(overrides?: Partial<Extract<PublishedPublicContent, { kind: "link" }>>): Extract<PublishedPublicContent, { kind: "link" }> {
  return {
    id: "link-1",
    kind: "link",
    title: "Published link",
    summary: "Summary",
    faviconAssetId: null,
    publishedAt: new Date("2026-03-21T09:00:00.000Z"),
    updatedAt: new Date("2026-03-21T12:00:00.000Z"),
    tags: [],
    url: "https://example.com/reference",
    ...overrides
  };
}

test("getPublicRobots disallows crawling when SITE_URL is unset", async () => {
  await withSiteUrl(undefined, () => {
    assert.deepEqual(getPublicRobots(), {
      rules: {
        userAgent: "*",
        disallow: "/"
      }
    });
  });
});

test("getPublicRobots advertises the sitemap when SITE_URL is configured", async () => {
  await withSiteUrl("https://notes.example.com", () => {
    assert.deepEqual(getPublicRobots(), {
      rules: {
        userAgent: "*",
        allow: "/"
      },
      sitemap: "https://notes.example.com/sitemap.xml"
    });
  });
});

test("buildPublicSitemap fails closed when SITE_URL is unset", async () => {
  await withSiteUrl(undefined, () => {
    assert.deepEqual(buildPublicSitemap([createPublishedNote()]), []);
  });
});

test("buildPublicSitemap includes the homepage plus published note routes only", async () => {
  await withSiteUrl("https://notes.example.com", () => {
    assert.deepEqual(buildPublicSitemap([createPublishedNote(), createPublishedLink()]), [
      {
        url: "https://notes.example.com/",
        lastModified: new Date("2026-03-21T12:00:00.000Z")
      },
      {
        url: "https://notes.example.com/notes/published-note",
        lastModified: new Date("2026-03-21T11:00:00.000Z")
      }
    ]);
  });
});
