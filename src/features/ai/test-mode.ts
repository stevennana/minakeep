import "server-only";

import { readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

export const PLAYWRIGHT_AI_TEST_MODE_FILE =
  process.env.PLAYWRIGHT_AI_TEST_MODE_FILE ?? path.join(tmpdir(), "minakeep-playwright-ai-mode.json");

export type PlaywrightAiTestMode = "passthrough" | "timeout";

type StoredPlaywrightAiTestMode = {
  mode?: string;
};

function isPlaywrightTestServer() {
  return process.env.PLAYWRIGHT_TEST === "1";
}

export function getPlaywrightAiTestMode(): PlaywrightAiTestMode {
  if (!isPlaywrightTestServer()) {
    return "passthrough";
  }

  try {
    const storedMode = JSON.parse(readFileSync(PLAYWRIGHT_AI_TEST_MODE_FILE, "utf8")) as StoredPlaywrightAiTestMode;

    return storedMode.mode === "timeout" ? "timeout" : "passthrough";
  } catch {
    return "passthrough";
  }
}

export function getPlaywrightAiTestBaseUrl() {
  const port = process.env.PLAYWRIGHT_WEB_SERVER_PORT ?? "3100";

  return `http://127.0.0.1:${port}/api/test/mina/`;
}
