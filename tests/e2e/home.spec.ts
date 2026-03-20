import "dotenv/config";

import { expect, test } from "@playwright/test";

import { setAiPlaywrightTestMode } from "./ai-test-mode";

// These journeys all mutate the same single-owner SQLite state, so serial execution keeps promotion checks deterministic.
test.describe.configure({ mode: "serial" });

test("public homepage exposes the published notes surface", async ({ page }) => {
  await page.goto("/");

  const emptyState = page.getByText("No published notes yet.");
  const publishedNoteEntry = page.locator(".note-list-item").first();

  await expect(page.getByRole("heading", { name: "Notes the owner has chosen to share." })).toBeVisible();
  await expect(page.getByRole("navigation").getByRole("link", { name: "Owner login" })).toBeVisible();
  await expect(emptyState.or(publishedNoteEntry)).toBeVisible();
});

test("anonymous visitors cannot access the owner search route", async ({ page }) => {
  await page.goto("/app/search");

  await expect(page).toHaveURL(/\/login/);
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
  await expect(page.getByTestId("note-enrichment-panel")).toContainText("AI note metadata");
  await page.goto("/app");
  await expect(page.getByRole("link", { name: updatedTitle })).toBeVisible();

  await page.getByRole("link", { name: updatedTitle }).click();
  await expect(page).toHaveURL(/\/app\/notes\/.+\/edit/);
  await expect(page.getByRole("textbox", { name: /^Title$/ })).toHaveValue(updatedTitle);
  await expect(page.getByRole("textbox", { name: /^Markdown body$/ })).toHaveValue(updatedMarkdown);
  await expect(page.getByTestId("note-markdown-preview").getByRole("heading", { name: `Revised ${uniqueId}` })).toBeVisible();
});

test("note save still succeeds when the configured AI endpoint times out and exposes a retry path", async ({ page }) => {
  const username = process.env.OWNER_USERNAME ?? "owner";
  const password = process.env.OWNER_PASSWORD ?? "password";
  const uniqueId = `${Date.now()}`;

  await setAiPlaywrightTestMode("timeout");

  try {
    await page.goto("/login");
    await page.getByLabel("Username").fill(username);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page).toHaveURL(/\/app$/);
    await page.getByRole("link", { name: "New note" }).click();

    await page.getByRole("textbox", { name: /^Title$/ }).fill(`Retry note ${uniqueId}`);
    await page.getByRole("textbox", { name: /^Markdown body$/ }).fill(`Body for retry note ${uniqueId}`);
    await page.getByRole("button", { name: "Create draft" }).click();

    await expect(page).toHaveURL(/\/app\/notes\/.+\/edit\?saved=1$/);
    const enrichmentPanel = page.getByTestId("note-enrichment-panel");
    await expect(enrichmentPanel).toContainText("AI pending");
    await expect(enrichmentPanel).toContainText("AI failed", { timeout: 15000 });
    await expect(enrichmentPanel).toContainText("The Mina AI endpoint timed out.");
    await expect(page.getByTestId("note-ai-summary")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Retry AI enrichment" })).toBeVisible();

    await page.getByRole("button", { name: "Retry AI enrichment" }).click();

    await expect(page).toHaveURL(/\/app\/notes\/.+\/edit\?retried=1$/);
    await expect(page.getByText("Retry requested.")).toBeVisible();
    await expect(page.getByTestId("note-enrichment-panel")).toContainText("AI failed", { timeout: 15000 });
    await expect(page.getByTestId("note-enrichment-panel")).toContainText("The Mina AI endpoint timed out.");
  } finally {
    await setAiPlaywrightTestMode("passthrough");
  }
});

test("owner can publish and unpublish a note across the public routes", async ({ page }) => {
  const username = process.env.OWNER_USERNAME ?? "owner";
  const password = process.env.OWNER_PASSWORD ?? "password";
  const uniqueId = `${Date.now()}`;
  const title = `Public note ${uniqueId}`;
  const markdown = `## Shared heading ${uniqueId}

This note should appear on the public site when published.`;
  const slug = `public-note-${uniqueId}`;

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

  await expect(page).toHaveURL(/\/app\/notes\/.+\/edit\?saved=1$/);
  await expect(page.getByText("Draft saved.")).toBeVisible();
  await expect(page.getByText("Private draft")).toBeVisible();

  await page.getByRole("button", { name: "Publish note" }).click();

  await expect(page).toHaveURL(/\/app\/notes\/.+\/edit\?published=1$/);
  await expect(page.getByText("Note published.")).toBeVisible();
  await expect(page.getByRole("link", { name: "View public note" })).toBeVisible();

  await page.goto("/");
  const publicNoteEntry = page.locator(".note-list-item").filter({ has: page.getByRole("link", { name: title }) });
  await expect(publicNoteEntry.getByRole("link", { name: title })).toBeVisible();
  await expect(publicNoteEntry.getByLabel("Published note tags")).toBeVisible();

  await page.getByRole("link", { name: title }).click();
  await expect(page).toHaveURL(new RegExp(`/notes/${slug}$`));
  await expect(page.getByTestId("public-note-markdown").getByRole("heading", { name: `Shared heading ${uniqueId}` })).toBeVisible();

  await page.goto("/app");
  await page.getByRole("link", { name: title }).click();
  await expect(page).toHaveURL(/\/app\/notes\/.+\/edit/);
  await page.getByRole("button", { name: "Unpublish note" }).click();

  await expect(page).toHaveURL(/\/app\/notes\/.+\/edit\?unpublished=1$/);
  await expect(page.getByText("Note unpublished.")).toBeVisible();

  await page.goto("/");
  await expect(page.getByRole("link", { name: title })).toHaveCount(0);

  const response = await page.goto(`/notes/${slug}`);
  expect(response?.status()).toBe(404);
  await expect(page.getByText("This page could not be found.")).toBeVisible();
});

test("owner can save and review a private tagged link without exposing it on public routes", async ({ page }) => {
  const username = process.env.OWNER_USERNAME ?? "owner";
  const password = process.env.OWNER_PASSWORD ?? "password";
  const uniqueId = `${Date.now()}`;
  const title = `Reference link ${uniqueId}`;
  const summary = `Summary for saved link ${uniqueId}`;
  const url = `https://example.com/reference-${uniqueId}`;

  await page.goto("/login");
  await page.getByLabel("Username").fill(username);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page).toHaveURL(/\/app$/);
  await page.getByRole("link", { name: "Links" }).click();

  await expect(page).toHaveURL(/\/app\/links$/);
  await page.getByRole("textbox", { name: /^URL$/ }).fill(url);
  await page.getByRole("textbox", { name: /^Title$/ }).fill(title);
  await page.getByRole("textbox", { name: /^Summary$/ }).fill(summary);
  await page.getByRole("textbox", { name: /^Tags$/ }).fill("research, reading");
  await page.getByRole("button", { name: "Save link" }).click();

  await expect(page).toHaveURL(/\/app\/links\?saved=1$/);
  await expect(page.getByText("Link saved.")).toBeVisible();
  const savedLinkEntry = page.locator("article").filter({ has: page.getByRole("link", { name: title }) });
  await expect(savedLinkEntry.getByRole("link", { name: title })).toHaveAttribute("href", url);
  await expect(savedLinkEntry.getByText(summary)).toBeVisible();
  await expect(savedLinkEntry.getByText("research", { exact: true })).toBeVisible();
  await expect(savedLinkEntry.getByText("reading", { exact: true })).toBeVisible();

  await page.goto("/");
  await expect(page.getByRole("link", { name: title })).toHaveCount(0);
  await expect(page.getByText(summary)).toHaveCount(0);
});

test("owner cannot save a private link with an unsafe URL scheme", async ({ page }) => {
  const username = process.env.OWNER_USERNAME ?? "owner";
  const password = process.env.OWNER_PASSWORD ?? "password";
  const title = `Unsafe link ${Date.now()}`;
  const summary = "This should be rejected.";

  await page.goto("/login");
  await page.getByLabel("Username").fill(username);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page).toHaveURL(/\/app$/);
  await page.getByRole("link", { name: "Links" }).click();

  await expect(page).toHaveURL(/\/app\/links$/);
  await page.getByLabel("URL").fill("ftp://example.com/private-reference");
  await page.getByLabel("Title").fill(title);
  await page.getByLabel("Summary").fill(summary);
  await page.getByRole("button", { name: "Save link" }).click();

  await expect(page).toHaveURL(/\/app\/links\?error=invalid-url$/);
  await expect(page.getByText("Enter a complete http:// or https:// URL.")).toBeVisible();
  await expect(page.getByRole("link", { name: title })).toHaveCount(0);
  await expect(page.getByText(summary)).toHaveCount(0);
});

test("owner can filter private links by tag and search notes by title plus links by URL and tag", async ({ page }) => {
  const username = process.env.OWNER_USERNAME ?? "owner";
  const password = process.env.OWNER_PASSWORD ?? "password";
  const uniqueId = `${Date.now()}`;
  const noteTitle = `Filtered note ${uniqueId}`;
  const noteMarkdown = `# Filtered ${uniqueId}

Private note for shared-tag retrieval.`;
  const linkTitle = `Filtered link ${uniqueId}`;
  const linkSummary = `Saved link for owner search ${uniqueId}`;
  const linkUrlNeedle = `url-needle-${uniqueId}`;
  const linkUrl = `https://example.com/${linkUrlNeedle}`;
  const linkOnlyTag = `link-only-${uniqueId}`;
  const searchTag = `search-tag-${uniqueId}`;

  await page.goto("/login");
  await page.getByLabel("Username").fill(username);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page).toHaveURL(/\/app$/);
  await page.getByRole("link", { name: "New note" }).click();
  await expect(page).toHaveURL(/\/app\/notes\/new$/);

  await page.getByRole("textbox", { name: /^Title$/ }).fill(noteTitle);
  await page.getByRole("textbox", { name: /^Markdown body$/ }).fill(noteMarkdown);
  await page.getByRole("button", { name: "Create draft" }).click();

  await expect(page).toHaveURL(/\/app\/notes\/.+\/edit\?saved=1$/);
  await expect(page.getByText("Draft saved.")).toBeVisible();

  await page.goto("/app/links");
  await expect(page).toHaveURL(/\/app\/links$/);
  await page.getByRole("textbox", { name: /^URL$/ }).fill(linkUrl);
  await page.getByRole("textbox", { name: /^Title$/ }).fill(linkTitle);
  await page.getByRole("textbox", { name: /^Summary$/ }).fill(linkSummary);
  await page.getByRole("textbox", { name: /^Tags$/ }).fill(`${linkOnlyTag}, ${searchTag}`);
  await page.getByRole("button", { name: "Save link" }).click();

  await expect(page).toHaveURL(/\/app\/links\?saved=1$/);
  await expect(page.getByText("Link saved.")).toBeVisible();

  await page.goto(`/app/tags?tag=${encodeURIComponent(linkOnlyTag)}`);
  await expect(page.getByRole("link", { name: linkTitle })).toBeVisible();
  await expect(page.getByRole("link", { name: noteTitle })).toHaveCount(0);

  await page.goto("/app/tags");
  await expect(page.getByRole("link", { name: noteTitle })).toBeVisible();
  await expect(page.getByRole("link", { name: linkTitle })).toBeVisible();

  await page.goto(`/app/search?q=${encodeURIComponent(noteTitle)}`);
  await expect(page.getByRole("link", { name: noteTitle })).toBeVisible();
  await expect(page.getByRole("link", { name: linkTitle })).toHaveCount(0);

  await page.goto(`/app/search?q=${encodeURIComponent(linkUrlNeedle)}`);
  await expect(page.getByRole("link", { name: linkTitle })).toBeVisible();
  await expect(page.getByRole("link", { name: noteTitle })).toHaveCount(0);

  await page.goto(`/app/search?q=${encodeURIComponent(searchTag)}`);
  await expect(page.getByRole("link", { name: linkTitle })).toBeVisible();
  await expect(page.getByRole("link", { name: noteTitle })).toHaveCount(0);
});
