import "dotenv/config";

import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";
import { expect, test, type Locator, type Page } from "@playwright/test";

const desktopViewport = { width: 1440, height: 900 };
const mobileViewport = { width: 390, height: 844 };

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL must be set before running note editor mobile UI tests.");
}

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({
    url: databaseUrl
  })
});

const seededNote = {
  title: "Mobile note editing should stay comfortable",
  slug: "mobile-note-editing-should-stay-comfortable",
  markdown: `## Mobile note editing should stay comfortable

Edit mode should prioritize one-pane writing on phones.

- Keep actions reachable
- Keep preview deliberate
- Keep saving obvious`,
  excerpt: "Phone-sized note editing should stay source-first without inheriting cramped desktop layout assumptions.",
  summary: "A mobile note workflow should use a deliberate edit and preview toggle while preserving the richer desktop workbench.",
  enrichmentStatus: "ready",
  enrichmentError: null,
  enrichmentAttempts: 1,
  enrichmentUpdatedAt: new Date("2024-05-28T10:15:00.000Z"),
  isPublished: false,
  publishedAt: null,
  updatedAt: new Date("2024-05-28T10:20:00.000Z"),
  tags: ["mobile", "editor", "workflow"]
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
    throw new Error(`Owner account '${username}' must exist before note editor mobile UI tests run.`);
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

async function expectTouchTarget(locator: Locator, label: string) {
  const box = await locator.boundingBox();

  expect(box, `${label} should have a measurable box`).not.toBeNull();

  if (!box) {
    return;
  }

  expect(box.height, `${label} should be at least 44px tall`).toBeGreaterThanOrEqual(44);
}

test.describe.configure({ mode: "serial" });

let seededNoteId = "";

test.beforeEach(async () => {
  seededNoteId = await seedEditableNote();
});

test.afterAll(async () => {
  await prisma.$disconnect();
});

test("@ui-note-editor-mobile phone workflow keeps edit, preview, and save comfortable", async ({ page }) => {
  await page.setViewportSize(mobileViewport);
  await signIn(page);
  await page.goto(`/app/notes/${seededNoteId}/edit`);

  const modeSwitcher = page.getByTestId("note-editor-mode-switcher");
  const editButton = modeSwitcher.getByRole("button", { name: "Edit" });
  const previewButton = modeSwitcher.getByRole("button", { name: "Preview" });
  const editor = page.getByTestId("note-markdown-input");
  const sourcePane = page.getByTestId("note-editor-source-pane");
  const previewPane = page.getByTestId("note-editor-preview-pane");
  const saveButton = page.getByRole("button", { name: "Save draft" });
  const boldButton = page.getByTestId("note-editor-toolbar").getByRole("button", { name: "Bold markdown" });

  await expect(page.getByRole("heading", { name: "Edit draft note" })).toBeVisible();
  await expect(modeSwitcher).toBeVisible();
  await expect(editButton).toHaveAttribute("aria-pressed", "true");
  await expect(sourcePane).toBeVisible();
  await expect(previewPane).toBeHidden();

  await expectTouchTarget(editButton, "Edit mode toggle");
  await expectTouchTarget(previewButton, "Preview mode toggle");
  await expectTouchTarget(boldButton, "Bold toolbar button");
  await expectTouchTarget(saveButton, "Save draft button");

  await editor.click();
  await editor.press("End");
  await editor.press("Enter");
  await editor.type("Thumb-friendly editing keeps the note flow practical.");
  await expect(editor).toHaveValue(/Thumb-friendly editing keeps the note flow practical\./);

  await previewButton.click();
  await expect(previewButton).toHaveAttribute("aria-pressed", "true");
  await expect(sourcePane).toBeHidden();
  await expect(previewPane).toBeVisible();
  await expect(page.getByTestId("note-markdown-preview")).toContainText("Thumb-friendly editing keeps the note flow practical.");

  await editButton.click();
  await expect(editButton).toHaveAttribute("aria-pressed", "true");
  await expect(editor).toBeFocused();
  await page.keyboard.press("Enter");
  await page.keyboard.type("Preview returns cleanly to editing.");
  await expect(editor).toHaveValue(/Preview returns cleanly to editing\./);

  await saveButton.click();
  await expect(page).toHaveURL(/\/app\/notes\/[^/]+\/edit\?saved=1$/);
  await expect(page.getByText("Draft saved.")).toBeVisible();
  await expect(page.getByTestId("note-markdown-input")).toHaveValue(/Preview returns cleanly to editing\./);
  await expectAccessibleStructure(page);
  await expectNoHorizontalOverflow(page);

  await expect(page.locator(".note-editor-shell")).toHaveScreenshot("ui-note-editor-mobile-phone.png", {
    animations: "disabled"
  });
});

test("@ui-note-editor-mobile desktop keeps split workbench available after mobile simplification", async ({ page }) => {
  await page.setViewportSize(desktopViewport);
  await signIn(page);
  await page.goto(`/app/notes/${seededNoteId}/edit`);

  const modeSwitcher = page.getByTestId("note-editor-mode-switcher");

  await expect(page.getByRole("heading", { name: "Edit draft note" })).toBeVisible();
  await expect(modeSwitcher).toBeVisible();
  await expect(modeSwitcher.getByRole("button", { name: "Source" })).toBeVisible();
  await expect(modeSwitcher.getByRole("button", { name: "Split" })).toBeVisible();
  await expect(modeSwitcher.getByRole("button", { name: "Preview" })).toBeVisible();
  await expect(modeSwitcher.getByRole("button", { name: "Split" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByTestId("note-editor-source-pane")).toBeVisible();
  await expect(page.getByTestId("note-editor-preview-pane")).toBeVisible();
  await expect(page.getByTestId("note-markdown-preview")).toContainText("Keep actions reachable");
  await expectAccessibleStructure(page);
  await expectNoHorizontalOverflow(page);

  await expect(page.locator(".note-editor-shell")).toHaveScreenshot("ui-note-editor-mobile-desktop.png", {
    animations: "disabled"
  });
});
