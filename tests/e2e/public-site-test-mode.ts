import { rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

export const PLAYWRIGHT_PUBLIC_SITE_URL_FILE =
  process.env.PLAYWRIGHT_PUBLIC_SITE_URL_FILE ?? path.join(tmpdir(), "minakeep-playwright-public-site-url.json");

export async function setPublicSiteUrlPlaywrightTestMode(siteUrl: string | null | "passthrough") {
  if (siteUrl === "passthrough") {
    await rm(PLAYWRIGHT_PUBLIC_SITE_URL_FILE, { force: true });
    return;
  }

  await writeFile(PLAYWRIGHT_PUBLIC_SITE_URL_FILE, `${JSON.stringify({ siteUrl })}\n`, "utf8");
}
