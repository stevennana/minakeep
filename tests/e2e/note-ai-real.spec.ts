import "dotenv/config";

import { expect, test } from "@playwright/test";

import { AI_REAL_ENV_MESSAGE, AI_REAL_TEST_TAG, hasAiRealEnv } from "./ai-real";
import { setAiPlaywrightTestMode } from "./ai-test-mode";

test.describe.configure({ mode: "serial" });
test.skip(!hasAiRealEnv(), AI_REAL_ENV_MESSAGE);
test.setTimeout(90000);

test(`owner note enrichment completes against the real Mina endpoint ${AI_REAL_TEST_TAG}`, async ({ page }) => {
  const username = process.env.OWNER_USERNAME ?? "owner";
  const password = process.env.OWNER_PASSWORD ?? "password";
  const uniqueId = `${Date.now()}`;
  const title = `AI enriched note ${uniqueId}`;
  const markdown = `# Shipping note ${uniqueId}

This note discusses reliable save flows, status visibility, and retry handling for AI-owned metadata.`;

  await setAiPlaywrightTestMode("passthrough");

  try {
    await page.goto("/login");
    await page.getByLabel("Username").fill(username);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page).toHaveURL(/\/app$/);
    await page.getByRole("link", { name: "New note" }).click();
    await expect(page).toHaveURL(/\/app\/notes\/new$/);

    await page.getByRole("textbox", { name: /^Title$/ }).fill(title);
    await page.getByRole("textbox", { name: /^Markdown body$/ }).fill(markdown);
    await page.getByRole("button", { name: "Create draft" }).click();

    await expect(page).toHaveURL(/\/app\/notes\/.+\/edit/);
    const enrichmentPanel = page.getByTestId("note-enrichment-panel");
    await expect(enrichmentPanel).toContainText("AI ready", { timeout: 60000 });
    await expect(page.getByTestId("note-ai-summary")).toBeVisible();
    await expect(page.getByTestId("note-ai-tags").locator(".tag-pill")).not.toHaveCount(0);

    await page.goto("/app");
    const noteCard = page.locator("article").filter({ has: page.getByRole("link", { name: title }) });
    await expect(noteCard).toContainText("AI ready");
    await expect(noteCard).toContainText("AI summary:");
  } finally {
    await setAiPlaywrightTestMode("disabled");
  }
});
