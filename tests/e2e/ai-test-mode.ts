import { rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

export const PLAYWRIGHT_AI_TEST_MODE_FILE =
  process.env.PLAYWRIGHT_AI_TEST_MODE_FILE ?? path.join(tmpdir(), "minakeep-playwright-ai-mode.json");

export async function setAiPlaywrightTestMode(mode: "passthrough" | "timeout") {
  if (mode === "passthrough") {
    await rm(PLAYWRIGHT_AI_TEST_MODE_FILE, { force: true });
    return;
  }

  await writeFile(PLAYWRIGHT_AI_TEST_MODE_FILE, `${JSON.stringify({ mode })}\n`, "utf8");
}
