import "dotenv/config";

import { expect, test } from "@playwright/test";

test("owner can sign in to the private dashboard", async ({ page }) => {
  await page.goto("/login");

  await page.getByLabel("Username").fill(process.env.OWNER_USERNAME ?? "owner");
  await page.getByLabel("Password").fill(process.env.OWNER_PASSWORD ?? "minakeep-local-password");
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page).toHaveURL(/\/app$/);
  await expect(page.getByRole("link", { name: "New note" })).toBeVisible();
});
