import { rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

export const PLAYWRIGHT_LINK_FAVICON_TEST_MODE_FILE =
  process.env.PLAYWRIGHT_LINK_FAVICON_TEST_MODE_FILE ?? path.join(tmpdir(), "minakeep-playwright-link-favicon-mode.json");

export async function setLinkFaviconPlaywrightTestMode(mode: "passthrough" | "success" | "failure") {
  if (mode === "passthrough") {
    await rm(PLAYWRIGHT_LINK_FAVICON_TEST_MODE_FILE, { force: true });
    return;
  }

  await writeFile(PLAYWRIGHT_LINK_FAVICON_TEST_MODE_FILE, `${JSON.stringify({ mode })}\n`, "utf8");
}
