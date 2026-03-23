import "server-only";

import type { MetadataRoute } from "next";

import type { PublishedPublicContent } from "@/features/public-content/types";
import { buildPublicUrl } from "@/features/public-site/config";
import { getPublishedNotePath, PUBLIC_HOME_PATH } from "@/features/public-site/metadata";

export const PUBLIC_SITEMAP_PATH = "/sitemap.xml";

function getPublicContentLastModified(item: Pick<PublishedPublicContent, "publishedAt" | "updatedAt">) {
  return item.updatedAt > item.publishedAt ? item.updatedAt : item.publishedAt;
}

function getHomepageLastModified(items: PublishedPublicContent[]) {
  if (items.length === 0) {
    return undefined;
  }

  return items.reduce((latest, item) => {
    const lastModified = getPublicContentLastModified(item);
    return lastModified > latest ? lastModified : latest;
  }, getPublicContentLastModified(items[0]));
}

export function getPublicRobots(): MetadataRoute.Robots {
  const sitemapUrl = buildPublicUrl(PUBLIC_SITEMAP_PATH);

  if (!sitemapUrl) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/"
      }
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/"
    },
    sitemap: sitemapUrl
  };
}

export function buildPublicSitemap(items: PublishedPublicContent[]): MetadataRoute.Sitemap {
  const homeUrl = buildPublicUrl(PUBLIC_HOME_PATH);

  if (!homeUrl) {
    return [];
  }

  const homepageLastModified = getHomepageLastModified(items);
  const homepageEntry: MetadataRoute.Sitemap[number] = homepageLastModified
    ? {
        url: homeUrl,
        lastModified: homepageLastModified
      }
    : {
        url: homeUrl
      };

  const publishedNoteEntries = items
    .filter((item): item is Extract<PublishedPublicContent, { kind: "note" }> => item.kind === "note")
    .map((item) => ({
      url: buildPublicUrl(getPublishedNotePath(item.slug)) ?? homeUrl,
      lastModified: getPublicContentLastModified(item)
    }));

  return [homepageEntry, ...publishedNoteEntries];
}
