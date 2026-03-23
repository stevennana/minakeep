import "server-only";

import type { Metadata } from "next";

import { buildPublicUrl } from "@/features/public-site/config";

export const PUBLIC_HOME_PATH = "/";

export function getPublishedNotePath(slug: string) {
  return `/notes/${encodeURIComponent(slug)}`;
}

export function getPublicPageMetadata(pathname: string): Pick<Metadata, "alternates" | "robots"> {
  const canonicalUrl = buildPublicUrl(pathname);

  if (!canonicalUrl) {
    return {
      robots: {
        index: false,
        follow: false
      }
    };
  }

  return {
    alternates: {
      canonical: canonicalUrl
    },
    robots: {
      index: true,
      follow: true
    }
  };
}
