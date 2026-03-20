import "dotenv/config";

import { expect, test } from "@playwright/test";

test("public homepage exposes the bootstrap foundation state", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Minakeep keeps the vault private and the notes intentional." })).toBeVisible();
  await expect(page.getByRole("navigation").getByRole("link", { name: "Owner login" })).toBeVisible();
});

test("owner can sign in, create a draft note, edit it, and reopen it with rendered preview", async ({ page }) => {
  const username = process.env.OWNER_USERNAME ?? "owner";
  const password = process.env.OWNER_PASSWORD ?? "password";
  const uniqueId = `${Date.now()}`;
  const initialTitle = `Draft note ${uniqueId}`;
  const updatedTitle = `Updated draft note ${uniqueId}`;
  const initialMarkdown = `# Preview ${uniqueId}

- first item
- second item`;
  const updatedMarkdown = `## Revised ${uniqueId}

Paragraph with **bold** text and a [link](https://example.com).`;

  await page.goto("/app/notes/new");
  await expect(page).toHaveURL(/\/login/);

  await page.getByLabel("Username").fill(username);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page).toHaveURL(/\/app$/);
  await page.getByRole("link", { name: "New note" }).click();

  await expect(page).toHaveURL(/\/app\/notes\/new$/);
  await page.getByRole("textbox", { name: /^Title$/ }).fill(initialTitle);
  await page.getByRole("textbox", { name: /^Markdown body$/ }).fill(initialMarkdown);

  const initialPreview = page.getByTestId("note-markdown-preview");
  await expect(initialPreview.getByRole("heading", { name: `Preview ${uniqueId}` })).toBeVisible();
  await expect(initialPreview.getByText("first item")).toBeVisible();

  await page.getByRole("button", { name: "Create draft" }).click();

  await expect(page).toHaveURL(/\/app\/notes\/.+\/edit\?saved=1$/);
  await expect(page.getByText("Draft saved.")).toBeVisible();

  await page.getByRole("textbox", { name: /^Title$/ }).fill(updatedTitle);
  await page.getByRole("textbox", { name: /^Markdown body$/ }).fill(updatedMarkdown);

  const updatedPreview = page.getByTestId("note-markdown-preview");
  await expect(updatedPreview.getByRole("heading", { name: `Revised ${uniqueId}` })).toBeVisible();
  await expect(updatedPreview.getByText("bold")).toBeVisible();

  await page.getByRole("button", { name: "Save draft" }).click();

  await expect(page).toHaveURL(/\/app\/notes\/.+\/edit\?saved=1$/);
  await page.goto("/app");
  await expect(page.getByRole("link", { name: updatedTitle })).toBeVisible();

  await page.getByRole("link", { name: updatedTitle }).click();
  await expect(page).toHaveURL(/\/app\/notes\/.+\/edit/);
  await expect(page.getByRole("textbox", { name: /^Title$/ })).toHaveValue(updatedTitle);
  await expect(page.getByRole("textbox", { name: /^Markdown body$/ })).toHaveValue(updatedMarkdown);
  await expect(page.getByTestId("note-markdown-preview").getByRole("heading", { name: `Revised ${uniqueId}` })).toBeVisible();
});
