import "dotenv/config";

import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";
import { expect, test, type Page } from "@playwright/test";

const desktopViewport = { width: 1440, height: 900 };
const mobileViewport = { width: 390, height: 844 };

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL must be set before running form UI tests.");
}

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({
    url: databaseUrl
  })
});

const editorSeed = {
  title: "Editor density should preserve the writing rhythm",
  slug: "editor-density-should-preserve-the-writing-rhythm",
  markdown: `# Editor density should preserve the writing rhythm

Compact editing surfaces should feel like working tools.

- Keep the form hierarchy readable
- Keep the preview easy to compare
- Keep AI metadata visible but secondary`,
  excerpt: "Compact editing surfaces should feel like working tools, not oversized landing-page cards.",
  summary: "A compact note editor should reduce introductory bulk while keeping preview and enrichment controls readable.",
  enrichmentStatus: "ready",
  enrichmentError: null,
  enrichmentAttempts: 1,
  enrichmentUpdatedAt: new Date("2024-05-21T09:00:00.000Z"),
  isPublished: true,
  publishedAt: new Date("2024-05-21T09:05:00.000Z"),
  updatedAt: new Date("2024-05-21T09:05:00.000Z"),
  tags: ["editor", "forms", "density"]
} as const;

function getOwnerCredentials() {
  return {
    username: process.env.OWNER_USERNAME ?? "owner",
    password: process.env.OWNER_PASSWORD ?? "password"
  };
}

async function seedEditorNote() {
  const { username } = getOwnerCredentials();
  const owner = await prisma.user.findUnique({
    where: {
      username
    }
  });

  if (!owner) {
    throw new Error(`Owner account '${username}' must exist before form UI tests run.`);
  }

  await prisma.note.deleteMany({
    where: {
      ownerId: owner.id
    }
  });

  const note = await prisma.note.create({
    data: {
      ownerId: owner.id,
      title: editorSeed.title,
      slug: editorSeed.slug,
      markdown: editorSeed.markdown,
      excerpt: editorSeed.excerpt,
      summary: editorSeed.summary,
      enrichmentStatus: editorSeed.enrichmentStatus,
      enrichmentError: editorSeed.enrichmentError,
      enrichmentAttempts: editorSeed.enrichmentAttempts,
      enrichmentUpdatedAt: editorSeed.enrichmentUpdatedAt,
      isPublished: editorSeed.isPublished,
      publishedAt: editorSeed.publishedAt,
      createdAt: editorSeed.updatedAt,
      updatedAt: editorSeed.updatedAt,
      tags: {
        connectOrCreate: editorSeed.tags.map((tag) => ({
          where: {
            name: tag
          },
          create: {
            name: tag
          }
        }))
      }
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

async function expectAccessibleStructure(page: Page) {
  const audit = await page.evaluate(() => {
    const issues: string[] = [];

    const getLabelText = (element: Element) => {
      const ariaLabel = element.getAttribute("aria-label")?.trim();
      if (ariaLabel) {
        return ariaLabel;
      }

      const labelledBy = element.getAttribute("aria-labelledby");
      if (labelledBy) {
        const text = labelledBy
          .split(/\s+/)
          .map((id) => document.getElementById(id)?.textContent?.trim() ?? "")
          .join(" ")
          .trim();

        if (text) {
          return text;
        }
      }

      if (
        element instanceof HTMLInputElement ||
        element instanceof HTMLTextAreaElement ||
        element instanceof HTMLSelectElement
      ) {
        const label = element.labels?.[0]?.textContent?.trim();

        if (label) {
          return label;
        }
      }

      return element.textContent?.trim() ?? "";
    };

    const interactive = document.querySelectorAll("a[href], button, input:not([type='hidden']), textarea, select");

    interactive.forEach((element) => {
      if (!getLabelText(element)) {
        const id = element.id ? `#${element.id}` : "";
        issues.push(`unnamed:${element.tagName.toLowerCase()}${id}`);
      }
    });

    document.querySelectorAll("nav").forEach((element, index) => {
      if (!element.getAttribute("aria-label")) {
        issues.push(`unlabeled-nav:${index + 1}`);
      }
    });

    return {
      h1Count: document.querySelectorAll("h1").length,
      issues,
      lang: document.documentElement.lang,
      mainCount: document.querySelectorAll("main").length
    };
  });

  expect(audit.lang).toBe("en");
  expect(audit.mainCount).toBe(1);
  expect(audit.h1Count).toBeGreaterThan(0);
  expect(audit.issues).toEqual([]);
}

async function expectLoginHierarchy(page: Page, viewport: "desktop" | "mobile") {
  const intro = page.locator(".login-intro-card");
  const form = page.locator(".login-form-card");

  const [introBox, formBox] = await Promise.all([intro.boundingBox(), form.boundingBox()]);

  expect(introBox).not.toBeNull();
  expect(formBox).not.toBeNull();

  if (!introBox || !formBox) {
    return;
  }

  expect(introBox.height).toBeLessThan(viewport === "desktop" ? 370 : 480);

  if (viewport === "desktop") {
    expect(introBox.x).toBeLessThan(formBox.x);
    expect(introBox.width).toBeGreaterThan(formBox.width);
    return;
  }

  expect(formBox.y).toBeGreaterThan(introBox.y);
}

async function expectEditorHierarchy(page: Page, viewport: "desktop" | "mobile") {
  const intro = page.locator(".note-editor-intro .ui-intro-block");
  const form = page.locator(".note-form");
  const sourcePane = page.getByTestId("note-editor-source-pane");

  const [introBox, formBox, sourceBox] = await Promise.all([
    intro.boundingBox(),
    form.boundingBox(),
    sourcePane.boundingBox()
  ]);

  expect(introBox).not.toBeNull();
  expect(formBox).not.toBeNull();
  expect(sourceBox).not.toBeNull();

  if (!introBox || !formBox || !sourceBox) {
    return;
  }

  expect(introBox.height).toBeLessThan(viewport === "desktop" ? 240 : 425);

  if (viewport === "desktop") {
    const previewBox = await page.getByTestId("note-editor-preview-pane").boundingBox();

    expect(previewBox).not.toBeNull();

    if (!previewBox) {
      return;
    }

    expect(sourceBox.x).toBeLessThan(previewBox.x);
    expect(sourceBox.width).toBeGreaterThan(previewBox.width);
    return;
  }
}

test.describe.configure({ mode: "serial" });

let seededNoteId = "";

test.beforeEach(async () => {
  seededNoteId = await seedEditorNote();
});

test.afterAll(async () => {
  await prisma.$disconnect();
});

test("@ui-regression @ui-forms login form stays compact on desktop", async ({ page }) => {
  await page.setViewportSize(desktopViewport);
  await page.goto("/login");

  await expect(page.getByRole("heading", { name: "Sign in to the private vault" })).toBeVisible();
  await expect(page.getByText("Credentials")).toBeVisible();
  await expect(page.getByLabel("Username")).toBeVisible();
  await expect(page.getByLabel("Password")).toBeVisible();
  await expectLoginHierarchy(page, "desktop");
  await expectAccessibleStructure(page);
  await expectNoHorizontalOverflow(page);

  await expect(page.locator(".login-layout")).toHaveScreenshot("ui-forms-login-desktop.png", {
    animations: "disabled"
  });
});

test("@ui-regression @ui-forms login form stays compact on mobile", async ({ page }) => {
  await page.setViewportSize(mobileViewport);
  await page.goto("/login");

  await expect(page.getByRole("heading", { name: "Sign in to the private vault" })).toBeVisible();
  await expect(page.getByText("Credentials")).toBeVisible();
  await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
  await expectLoginHierarchy(page, "mobile");
  await expectAccessibleStructure(page);
  await expectNoHorizontalOverflow(page);

  await expect(page.locator(".login-layout")).toHaveScreenshot("ui-forms-login-mobile.png", {
    animations: "disabled"
  });
});

test("@ui-regression @ui-forms note editor keeps hierarchy on desktop", async ({ page }) => {
  await page.setViewportSize(desktopViewport);
  await signIn(page);
  await page.goto(`/app/notes/${seededNoteId}/edit`);

  await expect(page.getByRole("heading", { name: "Edit draft note" })).toBeVisible();
  await expect(page.getByText("AI note metadata")).toBeVisible();
  await expect(page.locator(".note-form .section-heading").filter({ hasText: "Draft" })).toBeVisible();
  await expect(page.getByTestId("note-editor-mode-switcher")).toBeVisible();
  await expect(page.getByTestId("note-editor-preview-pane")).toContainText("Preview");
  await expect(page.getByTestId("note-markdown-preview")).toContainText("Compact editing surfaces should feel like working tools.");
  await expectEditorHierarchy(page, "desktop");
  await expectAccessibleStructure(page);
  await expectNoHorizontalOverflow(page);

  await expect(page.locator(".note-editor-shell")).toHaveScreenshot("ui-forms-editor-desktop.png", {
    animations: "disabled"
  });
});

test("@ui-regression @ui-forms note editor keeps hierarchy on mobile", async ({ page }) => {
  await page.setViewportSize(mobileViewport);
  await signIn(page);
  await page.goto(`/app/notes/${seededNoteId}/edit`);

  await expect(page.getByRole("heading", { name: "Edit draft note" })).toBeVisible();
  await expect(page.getByText("AI note metadata")).toBeVisible();
  await expect(page.getByLabel("Title")).toBeVisible();
  await expect(page.getByLabel("Markdown body")).toBeVisible();
  await expect(page.getByTestId("note-editor-mode-switcher")).toBeVisible();
  await expect(page.getByRole("button", { name: "Edit" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByTestId("note-editor-preview-pane")).toBeHidden();
  await expectEditorHierarchy(page, "mobile");
  await expectAccessibleStructure(page);
  await expectNoHorizontalOverflow(page);

  await expect(page.locator(".note-editor-shell")).toHaveScreenshot("ui-forms-editor-mobile.png", {
    animations: "disabled"
  });
});
