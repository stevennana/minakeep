import type { MetadataRoute } from "next";
import { headers } from "next/headers";

import { listPublishedContent } from "@/features/public-content/service";
import { getPublicSiteOriginStatus } from "@/features/public-site/config";
import { buildPublicSitemap } from "@/features/public-site/discovery";
import { logSeoRouteRequest } from "@/features/public-site/seo-logging";
import { getPublicHomepageLastChangedAt } from "@/features/public-site/state";
import { getSiteSettings } from "@/features/site-settings/service";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const startedAt = Date.now();
  const requestHeaders = await headers();
  const [publishedContent, homepageLastChangedAt, siteSettings, siteUrlStatus] = await Promise.all([
    listPublishedContent(),
    getPublicHomepageLastChangedAt(),
    getSiteSettings(),
    Promise.resolve(getPublicSiteOriginStatus())
  ]);
  const response = buildPublicSitemap(publishedContent, homepageLastChangedAt);

  logSeoRouteRequest({
    contentType: "application/xml; charset=utf-8",
    durationMs: Date.now() - startedAt,
    failClosed: siteUrlStatus.state !== "configured",
    headers: requestHeaders,
    path: "/sitemap.xml",
    seoDebugLoggingEnabled: siteSettings.seo.debugLoggingEnabled,
    sitemapEntryCount: response.length,
    siteUrlState: siteUrlStatus.state,
    status: 200
  });

  return response;
}
