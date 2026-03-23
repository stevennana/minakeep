import assert from "node:assert/strict";
import test from "node:test";

import { buildPublicUrl, getPublicSiteOriginStatus, PUBLIC_SITE_ORIGIN_ENV_KEY } from "../../src/features/public-site/config";
import { getPublicPageMetadata, getPublishedNotePath, PUBLIC_HOME_PATH } from "../../src/features/public-site/metadata";

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

test("getPublicSiteOriginStatus returns missing when SITE_URL is unset", async () => {
  await withSiteUrl(undefined, () => {
    assert.deepEqual(getPublicSiteOriginStatus(), {
      state: "missing"
    });
  });
});

test("getPublicSiteOriginStatus accepts a bare http(s) origin", async () => {
  await withSiteUrl("https://notes.example.com", () => {
    assert.deepEqual(getPublicSiteOriginStatus(), {
      state: "configured",
      origin: "https://notes.example.com"
    });
  });
});

test("getPublicSiteOriginStatus rejects non-origin SITE_URL values and fails closed", async () => {
  await withSiteUrl("https://notes.example.com/public?preview=1", () => {
    assert.deepEqual(getPublicSiteOriginStatus(), {
      state: "invalid",
      reason: "SITE_URL must be a bare origin without path, query, hash, or credentials."
    });
    assert.equal(buildPublicUrl(PUBLIC_HOME_PATH), null);
  });
});

test("getPublicPageMetadata emits canonical metadata when SITE_URL is configured", async () => {
  await withSiteUrl("https://notes.example.com", () => {
    assert.deepEqual(getPublicPageMetadata(getPublishedNotePath("hello world")), {
      alternates: {
        canonical: "https://notes.example.com/notes/hello%20world"
      },
      robots: {
        index: true,
        follow: true
      }
    });
  });
});

test("getPublicPageMetadata omits canonicals and noindexes when SITE_URL is missing", async () => {
  await withSiteUrl(undefined, () => {
    assert.deepEqual(getPublicPageMetadata(PUBLIC_HOME_PATH), {
      robots: {
        index: false,
        follow: false
      }
    });
  });
});

test("getPublicPageMetadata omits canonicals and noindexes when SITE_URL is invalid", async () => {
  await withSiteUrl("https://notes.example.com/public?preview=1", () => {
    assert.deepEqual(getPublicPageMetadata(PUBLIC_HOME_PATH), {
      robots: {
        index: false,
        follow: false
      }
    });
  });
});
