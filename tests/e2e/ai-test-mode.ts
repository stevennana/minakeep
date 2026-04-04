import { writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

export const PLAYWRIGHT_AI_TEST_MODE_FILE =
  process.env.PLAYWRIGHT_AI_TEST_MODE_FILE ?? path.join(tmpdir(), "minakeep-playwright-ai-mode.json");

export async function setAiPlaywrightTestMode(mode: "disabled" | "passthrough" | "success" | "timeout") {
  await writeFile(PLAYWRIGHT_AI_TEST_MODE_FILE, `${JSON.stringify({ mode })}\n`, "utf8");
}
