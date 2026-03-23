import "server-only";

import { readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

export const PLAYWRIGHT_PUBLIC_SITE_URL_FILE =
  process.env.PLAYWRIGHT_PUBLIC_SITE_URL_FILE ?? path.join(tmpdir(), "minakeep-playwright-public-site-url.json");

type StoredPlaywrightPublicSiteUrl = {
  siteUrl?: string | null;
};

function isPlaywrightTestServer() {
  return process.env.PLAYWRIGHT_TEST === "1";
}

export function getPlaywrightPublicSiteUrlOverride(): string | null | undefined {
  if (!isPlaywrightTestServer()) {
    return undefined;
  }

  try {
    const storedSiteUrl = JSON.parse(readFileSync(PLAYWRIGHT_PUBLIC_SITE_URL_FILE, "utf8")) as StoredPlaywrightPublicSiteUrl;

    if (storedSiteUrl.siteUrl === null) {
      return null;
    }

    if (typeof storedSiteUrl.siteUrl === "string") {
      const value = storedSiteUrl.siteUrl.trim();
      return value ? value : null;
    }

    return undefined;
  } catch {
    return undefined;
  }
}
