import "dotenv/config";

import { expect, test } from "@playwright/test";

import { AI_REAL_ENV_MESSAGE, AI_REAL_TEST_TAG, hasAiRealEnv } from "./ai-real";
import { setAiPlaywrightTestMode } from "./ai-test-mode";

test.describe.configure({ mode: "serial" });
test.skip(!hasAiRealEnv(), AI_REAL_ENV_MESSAGE);
test.setTimeout(90000);

test(`owner link enrichment completes against the real Mina endpoint ${AI_REAL_TEST_TAG}`, async ({ page }) => {
  const username = process.env.OWNER_USERNAME ?? "owner";
  const password = process.env.OWNER_PASSWORD ?? "password";
  const uniqueId = `${Date.now()}`;
  const title = `AI enriched link ${uniqueId}`;
  const url = `https://example.com/ai-enriched-link-${uniqueId}`;

  await setAiPlaywrightTestMode("passthrough");

  try {
    await page.goto("/login");
    await page.getByLabel("Username").fill(username);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page).toHaveURL(/\/app$/);
    await page.getByRole("navigation", { name: "Private vault sections" }).getByRole("link", { name: "Links" }).click();
    await expect(page).toHaveURL(/\/app\/links/);

    await page.getByRole("textbox", { name: /^URL$/ }).fill(url);
    await page.getByRole("textbox", { name: /^Title$/ }).fill(title);
    await page.getByRole("button", { name: "Save link" }).click();

    const linkCard = page.locator("article").filter({ has: page.getByRole("link", { name: title }) });
    await expect(linkCard).toContainText("AI ready", { timeout: 60000 });
    await expect(linkCard.getByTestId("link-ai-summary")).toBeVisible();
    await expect(linkCard.getByTestId("link-ai-tags").locator(".tag-pill")).not.toHaveCount(0);

    const generatedTag = (await linkCard.getByTestId("link-ai-tags").locator(".tag-pill").first().textContent())?.trim();

    await page.goto(`/app/search?q=${encodeURIComponent(generatedTag ?? "")}`);
    const searchResult = page.locator("article").filter({ has: page.getByRole("link", { name: title }) });
    await expect(searchResult).toContainText("AI ready");
    await expect(searchResult).toContainText("AI summary:");

    await page.goto(`/app/tags?tag=${encodeURIComponent(generatedTag ?? "")}`);
    const taggedResult = page.locator("article").filter({ has: page.getByRole("link", { name: title }) });
    await expect(taggedResult).toContainText("AI ready");
    await expect(taggedResult).toContainText("AI summary:");
  } finally {
    await setAiPlaywrightTestMode("disabled");
  }
});
