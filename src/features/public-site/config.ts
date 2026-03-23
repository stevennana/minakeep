import "server-only";

import { getPlaywrightPublicSiteUrlOverride } from "@/features/public-site/test-mode";

export const PUBLIC_SITE_ORIGIN_ENV_KEY = "SITE_URL";

export type PublicSiteOriginStatus =
  | {
      state: "configured";
      origin: string;
    }
  | {
      state: "missing";
    }
  | {
      state: "invalid";
      reason: string;
    };

function readSiteUrl() {
  const playwrightOverride = getPlaywrightPublicSiteUrlOverride();

  if (playwrightOverride !== undefined) {
    return playwrightOverride;
  }

  const value = process.env[PUBLIC_SITE_ORIGIN_ENV_KEY]?.trim();
  return value ? value : null;
}

function isSupportedProtocol(protocol: string) {
  return protocol === "http:" || protocol === "https:";
}

export function getPublicSiteOriginStatus(): PublicSiteOriginStatus {
  const siteUrl = readSiteUrl();

  if (!siteUrl) {
    return {
      state: "missing"
    };
  }

  let parsedUrl: URL;

  try {
    parsedUrl = new URL(siteUrl);
  } catch {
    return {
      state: "invalid",
      reason: "SITE_URL must be an absolute http(s) origin."
    };
  }

  if (!isSupportedProtocol(parsedUrl.protocol)) {
    return {
      state: "invalid",
      reason: "SITE_URL must use http or https."
    };
  }

  if (parsedUrl.username || parsedUrl.password || parsedUrl.search || parsedUrl.hash || parsedUrl.pathname !== "/") {
    return {
      state: "invalid",
      reason: "SITE_URL must be a bare origin without path, query, hash, or credentials."
    };
  }

  return {
    state: "configured",
    origin: parsedUrl.origin
  };
}

export function buildPublicUrl(pathname: string) {
  const status = getPublicSiteOriginStatus();

  if (status.state !== "configured") {
    return null;
  }

  return new URL(pathname, `${status.origin}/`).toString();
}
