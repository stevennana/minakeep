import type { MetadataRoute } from "next";
import { headers } from "next/headers";

import { getPublicRobots } from "@/features/public-site/discovery";
import { getPublicSiteOriginStatus } from "@/features/public-site/config";
import { logSeoRouteRequest } from "@/features/public-site/seo-logging";
import { getSiteSettings } from "@/features/site-settings/service";

export const dynamic = "force-dynamic";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const startedAt = Date.now();
  const requestHeaders = await headers();
  const [siteSettings, siteUrlStatus] = await Promise.all([getSiteSettings(), Promise.resolve(getPublicSiteOriginStatus())]);
  const response = getPublicRobots();

  logSeoRouteRequest({
    contentType: "text/plain; charset=utf-8",
    durationMs: Date.now() - startedAt,
    failClosed: siteUrlStatus.state !== "configured",
    headers: requestHeaders,
    path: "/robots.txt",
    seoDebugLoggingEnabled: siteSettings.seo.debugLoggingEnabled,
    siteUrlState: siteUrlStatus.state,
    status: 200
  });

  return response;
}
