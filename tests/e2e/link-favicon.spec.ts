import "dotenv/config";

import { expect, test, type Page } from "@playwright/test";

import { setAiPlaywrightTestMode } from "./ai-test-mode";
import { setLinkFaviconPlaywrightTestMode } from "./favicon-test-mode";

test.describe.configure({ mode: "serial" });

async function signIn(page: Page) {
  const username = process.env.OWNER_USERNAME ?? "owner";
  const password = process.env.OWNER_PASSWORD ?? "password";

  await page.goto("/login");
  await page.getByLabel("Username").fill(username);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/app$/);
}

// Hardening contract: favicon fetch failure must not block save, and the owner-visible
// fallback state must recover deterministically when a later refresh succeeds.
test("@media-regression @link-favicon link save caches a favicon locally for owner and public cards, and manual refresh can recover from failure", async ({
  page
}) => {
  const uniqueId = `${Date.now()}`;
  const cachedTitle = `Cached favicon link ${uniqueId}`;
  const cachedUrl = `https://example.com/cached-favicon-${uniqueId}`;
  const fallbackTitle = `Fallback favicon link ${uniqueId}`;
  const fallbackUrl = `https://example.com/fallback-favicon-${uniqueId}`;

  await setAiPlaywrightTestMode("success");
  await signIn(page);

  try {
    await setLinkFaviconPlaywrightTestMode("success");
    await page.goto("/app/links");
    await page.getByLabel("URL").fill(cachedUrl);
    await page.getByLabel("Title").fill(cachedTitle);
    await page.getByRole("button", { name: "Save link" }).click();

    await expect(page).toHaveURL(/\/app\/links\?saved=1$/);

    const cachedOwnerCard = page.locator("article").filter({ has: page.getByRole("link", { name: cachedTitle }) });
    const cachedOwnerFavicon = cachedOwnerCard.getByTestId("owner-link-favicon");
    await expect(cachedOwnerCard).toContainText("AI ready", { timeout: 15000 });
    await expect(cachedOwnerFavicon).toHaveAttribute("data-favicon-state", "cached", { timeout: 15000 });
    await expect(cachedOwnerFavicon.locator("img")).toHaveAttribute("src", /\/media\/[a-zA-Z0-9-]+$/);

    await cachedOwnerCard.getByRole("button", { name: "Publish link" }).click();
    await expect(page).toHaveURL(/\/app\/links\?published=1$/);

    await page.goto("/");
    const cachedPublicCard = page.locator("[data-card-kind='link']").filter({ has: page.getByRole("link", { name: cachedTitle }) });
    const cachedPublicFavicon = cachedPublicCard.getByTestId("public-link-card-favicon");
    await expect(cachedPublicFavicon).toHaveAttribute("data-favicon-state", "cached");
    await expect(cachedPublicFavicon.locator("img")).toHaveAttribute("src", /\/media\/[a-zA-Z0-9-]+$/);

    await setLinkFaviconPlaywrightTestMode("failure");
    await page.goto("/app/links");
    await page.getByLabel("URL").fill(fallbackUrl);
    await page.getByLabel("Title").fill(fallbackTitle);
    await page.getByRole("button", { name: "Save link" }).click();

    await expect(page).toHaveURL(/\/app\/links\?saved=1$/);

    const fallbackOwnerCard = page.locator("article").filter({ has: page.getByRole("link", { name: fallbackTitle }) });
    const fallbackOwnerFavicon = fallbackOwnerCard.getByTestId("owner-link-favicon");
    await expect(fallbackOwnerCard).toContainText("AI ready", { timeout: 15000 });
    await expect(fallbackOwnerFavicon).toHaveAttribute("data-favicon-state", "fallback");
    await expect(fallbackOwnerFavicon.locator("img")).toHaveAttribute("src", "/icons/link-favicon-fallback.svg");

    await setLinkFaviconPlaywrightTestMode("success");
    await fallbackOwnerCard.getByRole("button", { name: "Refresh favicon" }).click();

    await expect(page).toHaveURL(/\/app\/links\?favicon=1$/);
    await expect(page.getByText("Favicon refresh requested.")).toBeVisible();
    await expect(fallbackOwnerFavicon).toHaveAttribute("data-favicon-state", "cached", { timeout: 15000 });
    await expect(fallbackOwnerFavicon.locator("img")).toHaveAttribute("src", /\/media\/[a-zA-Z0-9-]+$/);
  } finally {
    await setAiPlaywrightTestMode("disabled");
    await setLinkFaviconPlaywrightTestMode("passthrough");
  }
});
