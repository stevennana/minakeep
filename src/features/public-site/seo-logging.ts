import "server-only";

import { serverLogger } from "@/lib/logging/server-logger";

type HeaderReader = {
  get(name: string): string | null;
};

type SeoRouteLogInput = {
  contentType: string;
  durationMs: number;
  failClosed: boolean;
  headers: HeaderReader;
  path: "/robots.txt" | "/sitemap.xml";
  seoDebugLoggingEnabled: boolean;
  sitemapEntryCount?: number;
  siteUrlState: "configured" | "missing" | "invalid";
  status: number;
};

const KNOWN_CRAWLER_PATTERNS = [/googlebot/i, /google-inspectiontool/i, /googleother/i, /bingbot/i, /duckduckbot/i, /yandexbot/i, /facebookexternalhit/i, /slackbot/i];

function matchesKnownCrawler(userAgent: string | null) {
  return userAgent ? KNOWN_CRAWLER_PATTERNS.some((pattern) => pattern.test(userAgent)) : false;
}

function matchesGoogleCrawler(userAgent: string | null) {
  return userAgent ? /googlebot|google-inspectiontool|googleother/i.test(userAgent) : false;
}

function toRemoteAddressCandidate(headers: HeaderReader) {
  return headers.get("cf-connecting-ip") ?? headers.get("x-real-ip") ?? headers.get("true-client-ip") ?? null;
}

export function logSeoRouteRequest(input: SeoRouteLogInput) {
  if (!input.seoDebugLoggingEnabled) {
    return;
  }

  const userAgent = headersToSingleLine(input.headers.get("user-agent"));
  const isKnownCrawler = matchesKnownCrawler(userAgent);
  const metadata = {
    contentType: input.contentType,
    durationMs: input.durationMs,
    failClosed: input.failClosed,
    forwardedFor: headersToSingleLine(input.headers.get("x-forwarded-for")),
    forwardedHost: headersToSingleLine(input.headers.get("x-forwarded-host")),
    forwardedProto: headersToSingleLine(input.headers.get("x-forwarded-proto")),
    host: headersToSingleLine(input.headers.get("host")),
    isGooglebot: matchesGoogleCrawler(userAgent),
    isKnownCrawler,
    path: input.path,
    remoteAddressCandidate: toRemoteAddressCandidate(input.headers),
    sitemapEntryCount: input.sitemapEntryCount,
    siteUrlState: input.siteUrlState,
    status: input.status,
    userAgent
  };

  if (isKnownCrawler) {
    serverLogger.info("SEO route served.", metadata);
    return;
  }

  serverLogger.debug("SEO route served.", metadata);
}

function headersToSingleLine(value: string | null) {
  return value?.replace(/\s+/g, " ").trim() ?? null;
}
