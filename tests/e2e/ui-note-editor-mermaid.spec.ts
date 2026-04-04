import "dotenv/config";

import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";
import { expect, test, type Page } from "@playwright/test";

const desktopViewport = { width: 1440, height: 900 };
const mobileViewport = { width: 390, height: 844 };

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL must be set before running note editor Mermaid UI tests.");
}

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({
    url: databaseUrl
  })
});

const seededNote = {
  title: "Editor Mermaid preview should stay source-first",
  slug: "editor-mermaid-preview-should-stay-source-first",
  markdown: `## Workbench preview should match the public renderer

The editor preview should render Mermaid from the same markdown source without rewriting the authored fence.

\`\`\`mermaid
flowchart LR
  Draft[Draft note] --> Review{Ready to publish?}
  Review -->|yes| Public[Public note page]
  Review -->|no| Revise[Keep editing]
\`\`\`

### Invalid Mermaid should fail softly

\`\`\`mermaid
This is not valid Mermaid source.
\`\`\`

The author should still be able to inspect the fallback, keep saving, and publish later.`,
  excerpt: "Editor preview should render Mermaid diagrams and bounded fallbacks without mutating the markdown source.",
  summary: "Workbench preview should use the shared Mermaid rendering path while preserving raw markdown fences as the saved source.",
  enrichmentStatus: "ready",
  enrichmentError: null,
  enrichmentAttempts: 1,
  enrichmentUpdatedAt: new Date("2024-06-03T09:30:00.000Z"),
  isPublished: false,
  publishedAt: null,
  updatedAt: new Date("2024-06-03T09:35:00.000Z"),
  tags: ["editor", "mermaid", "preview"]
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
    throw new Error(`Owner account '${username}' must exist before note editor Mermaid UI tests run.`);
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

async function expectMermaidPreviewSurface(page: Page, viewport: "desktop" | "mobile") {
  const metrics = await page.evaluate(() => {
    const preview = document.querySelector<HTMLElement>("[data-testid='note-markdown-preview']");
    const rendered = document.querySelector<HTMLElement>("[data-testid='note-markdown-preview'] .markdown-mermaid--rendered");
    const fallback = document.querySelector<HTMLElement>("[data-testid='note-markdown-preview'] .markdown-mermaid--fallback");
    const svg = rendered?.querySelector<SVGElement>(".markdown-mermaid-svg");
    const fallbackPre = fallback?.querySelector<HTMLElement>("pre");

    if (!preview || !rendered || !fallback || !svg || !fallbackPre) {
      throw new Error("Expected Mermaid editor preview anchors to exist.");
    }

    const previewRect = preview.getBoundingClientRect();
    const renderedRect = rendered.getBoundingClientRect();
    const fallbackRect = fallback.getBoundingClientRect();
    const svgRect = svg.getBoundingClientRect();
    const fallbackPreRect = fallbackPre.getBoundingClientRect();

    return {
      fallbackPreWidth: Math.round(fallbackPreRect.width),
      fallbackWidth: Math.round(fallbackRect.width),
      previewWidth: Math.round(previewRect.width),
      renderedWidth: Math.round(renderedRect.width),
      svgWidth: Math.round(svgRect.width),
      viewportWidth: document.documentElement.clientWidth
    };
  });

  expect(metrics.renderedWidth).toBeLessThanOrEqual(metrics.previewWidth + 1);
  expect(metrics.fallbackWidth).toBeLessThanOrEqual(metrics.previewWidth + 1);
  expect(metrics.fallbackPreWidth).toBeLessThanOrEqual(metrics.fallbackWidth + 1);
  expect(metrics.svgWidth).toBeLessThanOrEqual(metrics.renderedWidth + 1);
  expect(metrics.svgWidth).toBeGreaterThanOrEqual(Math.max(220, metrics.previewWidth - 40));
}

async function expectMermaidPreviewContent(page: Page) {
  const editor = page.getByTestId("note-markdown-input");
  const preview = page.getByTestId("note-markdown-preview");

  await expect(editor).toHaveValue(seededNote.markdown);
  await expect(editor).toHaveValue(/```mermaid/);
  await expect(preview.locator(".markdown-mermaid--rendered svg[aria-label='Rendered Mermaid diagram']")).toBeVisible();
  await expect(preview.locator(".markdown-mermaid--fallback")).toContainText("Diagram preview unavailable");
  await expect(preview.locator(".markdown-mermaid--fallback")).toContainText("This is not valid Mermaid source.");
  await expect(preview).not.toContainText("```mermaid");
  await expect(preview).not.toContainText("flowchart LR");
  await expect(preview.locator("[data-processed='true']")).toHaveCount(0);
}

test.describe.configure({ mode: "serial" });

let seededNoteId = "";

test.beforeEach(async () => {
  seededNoteId = await seedEditableNote();
});

test.afterAll(async () => {
  await prisma.$disconnect();
});

test("@ui-note-editor-mermaid desktop split and preview-only modes render Mermaid through the shared preview path", async ({ page }) => {
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
  await expectMermaidPreviewContent(page);
  await expectMermaidPreviewSurface(page, "desktop");

  await previewButton.click();
  await expect(previewButton).toHaveAttribute("aria-pressed", "true");
  await expect(sourcePane).toBeHidden();
  await expect(previewPane).toBeVisible();
  await expectMermaidPreviewContent(page);

  await page.getByRole("button", { name: "Save draft" }).click();
  await expect(page).toHaveURL(/\/app\/notes\/[^/]+\/edit\?saved=1$/);
  await expect(page.getByText("Draft saved.")).toBeVisible();
  await expect(page.getByTestId("note-markdown-input")).toHaveValue(seededNote.markdown);
  await expectMermaidPreviewContent(page);
  await expectNoHorizontalOverflow(page);

  const savedNote = await prisma.note.findUnique({
    where: {
      id: seededNoteId
    }
  });

  expect(savedNote?.markdown).toBe(seededNote.markdown);

  await expect(page.locator(".note-editor-shell")).toHaveScreenshot("ui-note-editor-mermaid-desktop.png", {
    animations: "disabled"
  });
});

test("@ui-note-editor-mermaid mobile preview keeps Mermaid diagrams and fallbacks bounded without rewriting markdown", async ({ page }) => {
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
  await expectMermaidPreviewContent(page);
  await expectMermaidPreviewSurface(page, "mobile");
  await expectNoHorizontalOverflow(page);

  await editButton.click();
  await expect(editButton).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByTestId("note-markdown-input")).toHaveValue(seededNote.markdown);

  await expect(page.locator(".note-editor-shell")).toHaveScreenshot("ui-note-editor-mermaid-mobile.png", {
    animations: "disabled"
  });
});
