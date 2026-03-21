import "server-only";

import { readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

export const PLAYWRIGHT_LINK_FAVICON_TEST_MODE_FILE =
  process.env.PLAYWRIGHT_LINK_FAVICON_TEST_MODE_FILE ?? path.join(tmpdir(), "minakeep-playwright-link-favicon-mode.json");

export type PlaywrightLinkFaviconTestMode = "passthrough" | "success" | "failure";

type StoredPlaywrightLinkFaviconTestMode = {
  mode?: string;
};

function isPlaywrightTestServer() {
  return process.env.PLAYWRIGHT_TEST === "1";
}

export function getPlaywrightLinkFaviconTestMode(): PlaywrightLinkFaviconTestMode {
  if (!isPlaywrightTestServer()) {
    return "passthrough";
  }

  try {
    const storedMode = JSON.parse(readFileSync(PLAYWRIGHT_LINK_FAVICON_TEST_MODE_FILE, "utf8")) as StoredPlaywrightLinkFaviconTestMode;

    if (storedMode.mode === "failure") {
      return "failure";
    }

    if (storedMode.mode === "success") {
      return "success";
    }

    return "passthrough";
  } catch {
    return "passthrough";
  }
}
