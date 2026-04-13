import "dotenv/config";

import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";
import { expect, test, type Page } from "@playwright/test";

const desktopViewport = { width: 1440, height: 900 };
const mobileViewport = { width: 390, height: 844 };

const databaseUrl = process.env.DATABASE_URL?.startsWith("file:./")
  ? "file:" + process.cwd() + "/" + process.env.DATABASE_URL.slice("file:./".length)
  : process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL must be set before running note editor reference-link UI tests.");
}

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({
    url: databaseUrl
  })
});

const seededNote = {
  title: "Editor reference-link preview should match published notes",
  slug: "editor-reference-link-preview-should-match-published-notes",
  markdown: `## Preview parity should hold in every editor mode

The split preview should render a source marker[^renderer] without exposing the raw definition line.

When the editor switches to preview-only mode, the same source[^renderer] should still point to one bottom entry and a second source[^preview] should remain distinct.

### References should stay calm on narrow screens

The preview should make the bottom bibliography feel supportive rather than bolted on.

[^renderer]: [Shared renderer contract](https://example.com/shared-renderer-contract)
[^preview]: [Owner preview verification note](https://example.com/owner-preview-verification)`,
  excerpt: "The editor preview should render reference links exactly like the published note surface.",
  summary: "Owner preview should share the same calm reference markers and bottom references section as the public note renderer.",
  enrichmentStatus: "ready",
  enrichmentError: null,
  enrichmentAttempts: 1,
  enrichmentUpdatedAt: new Date("2024-06-05T09:30:00.000Z"),
  isPublished: false,
  publishedAt: null,
  updatedAt: new Date("2024-06-05T09:35:00.000Z"),
  tags: ["editor", "references", "preview"]
} as const;

function getOwnerCredentials() {
  return {
    password: process.env.OWNER_PASSWORD ?? "password",
    username: process.env.OWNER_USERNAME ?? "owner"
  };
}

async function seedEditableNote() {
  const { username } = getOwnerCredentials();
  const owner = await prisma.user.findUnique({
    where: {
      username
    }
  });

  if (!owner) {
    throw new Error(`Owner account '${username}' must exist before note editor reference-link UI tests run.`);
  }

  await prisma.note.deleteMany({
    where: {
      ownerId: owner.id
    }
  });

  const note = await prisma.note.create({
    data: {
      createdAt: seededNote.updatedAt,
      enrichmentAttempts: seededNote.enrichmentAttempts,
      enrichmentError: seededNote.enrichmentError,
      enrichmentStatus: seededNote.enrichmentStatus,
      enrichmentUpdatedAt: seededNote.enrichmentUpdatedAt,
      excerpt: seededNote.excerpt,
      isPublished: seededNote.isPublished,
      markdown: seededNote.markdown,
      ownerId: owner.id,
      publishedAt: seededNote.publishedAt,
      slug: seededNote.slug,
      summary: seededNote.summary,
      tags: {
        connectOrCreate: seededNote.tags.map((tag) => ({
          create: {
            name: tag
          },
          where: {
            name: tag
          }
        }))
      },
      title: seededNote.title,
      updatedAt: seededNote.updatedAt
    }
  });

  return note.id;
}

async function signIn(page: Page) {
  const { username, password } = getOwnerCredentials();

  await page.goto("/login");
  await page.getByLabel("Username").fill(username);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/app$/);
}

async function expectNoHorizontalOverflow(page: Page) {
  const hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);

  expect(hasOverflow).toBe(false);
}

async function expectPreviewReferenceSurface(page: Page, viewport: "desktop" | "mobile") {
  const metrics = await page.evaluate(() => {
    const preview = document.querySelector<HTMLElement>("[data-testid='note-markdown-preview']");
    const markers = Array.from(document.querySelectorAll<HTMLElement>("[data-testid='note-markdown-preview'] .markdown-reference-marker-link"));
    const section = document.querySelector<HTMLElement>("[data-testid='note-markdown-preview'] .markdown-reference-section");
    const entries = Array.from(document.querySelectorAll<HTMLElement>("[data-testid='note-markdown-preview'] .markdown-reference-list-item"));

    if (!preview || !section || markers.length === 0 || entries.length === 0) {
      throw new Error("Expected note editor preview reference-link anchors to exist.");
    }

    const previewRect = preview.getBoundingClientRect();
    const sectionRect = section.getBoundingClientRect();

    return {
      entryWidths: entries.map((entry) => Math.round(entry.getBoundingClientRect().width)),
      markerHeights: markers.map((marker) => Math.round(marker.getBoundingClientRect().height)),
      markerWidths: markers.map((marker) => Math.round(marker.getBoundingClientRect().width)),
      previewWidth: Math.round(previewRect.width),
      sectionWidth: Math.round(sectionRect.width)
    };
  });

  expect(metrics.sectionWidth).toBeLessThanOrEqual(metrics.previewWidth + 1);

  for (const width of metrics.entryWidths) {
    expect(width).toBeLessThanOrEqual(metrics.sectionWidth + 1);
  }

  for (const width of metrics.markerWidths) {
    expect(width).toBeGreaterThanOrEqual(viewport === "desktop" ? 22 : 24);
  }

  for (const height of metrics.markerHeights) {
    expect(height).toBeGreaterThanOrEqual(viewport === "desktop" ? 22 : 24);
  }
}

async function expectPreviewReferenceNavigation(page: Page) {
  const firstMarker = page.locator("[data-testid='note-markdown-preview'] .markdown-reference-marker-link").first();
  const targetId = await firstMarker.getAttribute("href");

  expect(targetId).toBeTruthy();

  await firstMarker.click();
  await expect(page).toHaveURL(new RegExp(`${targetId?.replace("#", "#")}$`));

  const targetVisible = await page.evaluate((selector) => {
    const target = document.querySelector<HTMLElement>(selector);

    if (!target) {
      return false;
    }

    const rect = target.getBoundingClientRect();
    return rect.top >= 0 && rect.top <= window.innerHeight;
  }, targetId ?? "");

  expect(targetVisible).toBe(true);
}

async function expectPreviewReferenceContent(page: Page) {
  const editor = page.getByTestId("note-markdown-input");
  const preview = page.getByTestId("note-markdown-preview");

  await expect(editor).toHaveValue(seededNote.markdown);
  await expect(editor).toHaveValue(/\[\^renderer\]: \[Shared renderer contract\]/);
  await expect(editor).toHaveValue(/\[\^preview\]: \[Owner preview verification note\]/);
  await expect(preview.locator(".markdown-reference-marker-link")).toHaveCount(3);
  await expect(preview.locator(".markdown-reference-list-item")).toHaveCount(2);
  await expect(preview.getByRole("heading", { exact: true, name: "References" })).toBeVisible();
  await expect(preview.getByRole("link", { name: "Shared renderer contract" })).toHaveAttribute(
    "href",
    "https://example.com/shared-renderer-contract"
  );
  await expect(preview.getByRole("link", { name: "Owner preview verification note" })).toHaveAttribute(
    "href",
    "https://example.com/owner-preview-verification"
  );
  await expect(preview).not.toContainText("[^renderer]: [Shared renderer contract]");
  await expect(preview).not.toContainText("[^preview]: [Owner preview verification note]");
}

test.describe.configure({ mode: "serial" });

let seededNoteId = "";

test.beforeEach(async () => {
  seededNoteId = await seedEditableNote();
});

test.afterAll(async () => {
  await prisma.$disconnect();
});

test("@ui-note-editor-reference-links @ui-reference-link-regression desktop split and preview-only modes match the published reference-link renderer", async ({
  page
}) => {
  await page.setViewportSize(desktopViewport);
  await signIn(page);
  await page.goto(`/app/notes/${seededNoteId}/edit`);

  const modeSwitcher = page.getByTestId("note-editor-mode-switcher");
  const splitButton = modeSwitcher.getByRole("button", { name: "Split" });
  const previewButton = modeSwitcher.getByRole("button", { name: "Preview" });
  const sourcePane = page.getByTestId("note-editor-source-pane");
  const previewPane = page.getByTestId("note-editor-preview-pane");

  await expect(page.getByRole("heading", { name: "Edit draft note" })).toBeVisible();
  await expect(splitButton).toHaveAttribute("aria-pressed", "true");
  await expect(sourcePane).toBeVisible();
  await expect(previewPane).toBeVisible();
  await expectPreviewReferenceContent(page);
  await expectPreviewReferenceSurface(page, "desktop");
  await expectPreviewReferenceNavigation(page);

  await previewButton.click();
  await expect(previewButton).toHaveAttribute("aria-pressed", "true");
  await expect(sourcePane).toBeHidden();
  await expect(previewPane).toBeVisible();
  await expectPreviewReferenceContent(page);
  await expectPreviewReferenceSurface(page, "desktop");

  await page.getByRole("button", { name: "Save draft" }).click();
  await expect(page).toHaveURL(/\/app\/notes\/[^/]+\/edit\?saved=1(#markdown-reference-renderer)?$/);
  await expect(page.getByText("Draft saved.")).toBeVisible();
  await expect(page.getByTestId("note-markdown-input")).toHaveValue(seededNote.markdown);
  await expectNoHorizontalOverflow(page);

  const savedNote = await prisma.note.findUnique({
    where: {
      id: seededNoteId
    }
  });

  expect(savedNote?.markdown).toBe(seededNote.markdown);

  await expect(page.locator(".note-editor-shell")).toHaveScreenshot("ui-note-editor-reference-links-desktop.png", {
    animations: "disabled",
    maxDiffPixels: 1000
  });
});

test("@ui-note-editor-reference-links @ui-reference-link-regression mobile preview keeps reference markers and references section bounded", async ({
  page
}) => {
  await page.setViewportSize(mobileViewport);
  await signIn(page);
  await page.goto(`/app/notes/${seededNoteId}/edit`);

  const modeSwitcher = page.getByTestId("note-editor-mode-switcher");
  const editButton = modeSwitcher.getByRole("button", { name: "Edit" });
  const previewButton = modeSwitcher.getByRole("button", { name: "Preview" });
  const sourcePane = page.getByTestId("note-editor-source-pane");
  const previewPane = page.getByTestId("note-editor-preview-pane");

  await expect(page.getByRole("heading", { name: "Edit draft note" })).toBeVisible();
  await expect(editButton).toHaveAttribute("aria-pressed", "true");
  await expect(sourcePane).toBeVisible();
  await expect(previewPane).toBeHidden();

  await previewButton.click();
  await expect(previewButton).toHaveAttribute("aria-pressed", "true");
  await expect(sourcePane).toBeHidden();
  await expect(previewPane).toBeVisible();
  await expectPreviewReferenceContent(page);
  await expectPreviewReferenceSurface(page, "mobile");
  await expectPreviewReferenceNavigation(page);
  await expectNoHorizontalOverflow(page);

  await editButton.click();
  await expect(editButton).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByTestId("note-markdown-input")).toHaveValue(seededNote.markdown);

  await expect(page.locator(".note-editor-shell")).toHaveScreenshot("ui-note-editor-reference-links-mobile.png", {
    animations: "disabled",
    maxDiffPixels: 1000
  });
});
