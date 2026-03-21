import "dotenv/config";

import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";
import { expect, test, type Page } from "@playwright/test";

const desktopViewport = { width: 1440, height: 900 };
const mobileViewport = { width: 390, height: 844 };

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL must be set before running note editor mode UI tests.");
}

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({
    url: databaseUrl
  })
});

const seededNote = {
  title: "View modes should keep drafting steady",
  slug: "view-modes-should-keep-drafting-steady",
  markdown: `# View modes should keep drafting steady

Split mode should keep source and preview aligned while the owner writes.

- Preserve the markdown body
- Keep preview continuity`,
  excerpt: "View modes should make preview review clearer without disrupting source-first drafting.",
  summary: "Stable source, split, and preview modes should preserve markdown continuity in the private note workbench.",
  enrichmentStatus: "ready",
  enrichmentError: null,
  enrichmentAttempts: 1,
  enrichmentUpdatedAt: new Date("2024-05-27T09:30:00.000Z"),
  isPublished: false,
  publishedAt: null,
  updatedAt: new Date("2024-05-27T09:35:00.000Z"),
  tags: ["editor", "modes", "preview"]
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
    throw new Error(`Owner account '${username}' must exist before note editor mode UI tests run.`);
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

async function expectSplitWorkbenchLayout(page: Page, viewport: "desktop" | "mobile") {
  const workbench = page.getByTestId("note-markdown-workbench");
  const sourcePane = page.getByTestId("note-editor-source-pane");
  const previewPane = page.getByTestId("note-editor-preview-pane");

  const [workbenchBox, sourceBox, previewBox] = await Promise.all([
    workbench.boundingBox(),
    sourcePane.boundingBox(),
    previewPane.boundingBox()
  ]);

  expect(workbenchBox).not.toBeNull();
  expect(sourceBox).not.toBeNull();
  expect(previewBox).not.toBeNull();

  if (!workbenchBox || !sourceBox || !previewBox) {
    return;
  }

  if (viewport === "desktop") {
    expect(sourceBox.x).toBeLessThan(previewBox.x);
    expect(sourceBox.width).toBeGreaterThan(previewBox.width);
    expect(previewBox.x + previewBox.width).toBeLessThanOrEqual(workbenchBox.x + workbenchBox.width + 1);
    return;
  }

  expect(previewBox.y).toBeGreaterThan(sourceBox.y);
}

test.describe.configure({ mode: "serial" });

let seededNoteId = "";

test.beforeEach(async () => {
  seededNoteId = await seedEditableNote();
});

test.afterAll(async () => {
  await prisma.$disconnect();
});

test("@ui-note-editor-modes desktop mode switching keeps markdown and preview stable", async ({ page }) => {
  await page.setViewportSize(desktopViewport);
  await signIn(page);
  await page.goto(`/app/notes/${seededNoteId}/edit`);

  const editor = page.getByTestId("note-markdown-input");
  const modeSwitcher = page.getByTestId("note-editor-mode-switcher");
  const sourceButton = modeSwitcher.getByRole("button", { name: "Source" });
  const splitButton = modeSwitcher.getByRole("button", { name: "Split" });
  const previewButton = modeSwitcher.getByRole("button", { name: "Preview" });
  const sourcePane = page.getByTestId("note-editor-source-pane");
  const previewPane = page.getByTestId("note-editor-preview-pane");

  await expect(modeSwitcher).toBeVisible();
  await expect(splitButton).toHaveAttribute("aria-pressed", "true");
  await expect(sourcePane).toBeVisible();
  await expect(previewPane).toBeVisible();

  await editor.click();
  await editor.press("End");
  await editor.press("Enter");
  await editor.type("Draft in split mode");
  await expect(editor).toHaveValue(/Draft in split mode/);
  await expect(page.getByTestId("note-markdown-preview")).toContainText("Draft in split mode");

  await previewButton.click();
  await expect(previewButton).toHaveAttribute("aria-pressed", "true");
  await expect(sourcePane).toBeHidden();
  await expect(previewPane).toBeVisible();
  await expect(page.getByTestId("note-markdown-preview")).toContainText("Draft in split mode");

  await sourceButton.click();
  await expect(sourceButton).toHaveAttribute("aria-pressed", "true");
  await expect(sourcePane).toBeVisible();
  await expect(previewPane).toBeHidden();
  await expect(editor).toBeFocused();
  await page.keyboard.press("Enter");
  await page.keyboard.type("Returns from preview mode");
  await expect(editor).toHaveValue(/Returns from preview mode/);

  await splitButton.click();
  await expect(splitButton).toHaveAttribute("aria-pressed", "true");
  await expect(sourcePane).toBeVisible();
  await expect(previewPane).toBeVisible();
  await expect(page.getByTestId("note-markdown-preview")).toContainText("Returns from preview mode");

  await page.getByRole("button", { name: "Save draft" }).click();
  await expect(page).toHaveURL(/\/app\/notes\/[^/]+\/edit\?saved=1$/);
  await expect(page.getByText("Draft saved.")).toBeVisible();
  await expect(page.getByTestId("note-markdown-input")).toHaveValue(/Returns from preview mode/);
  await expect(page.getByTestId("note-markdown-preview")).toContainText("Returns from preview mode");

  await page.reload();
  await expect(splitButton).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByTestId("note-markdown-input")).toHaveValue(/Returns from preview mode/);
  await expect(page.getByTestId("note-markdown-preview")).toContainText("Returns from preview mode");
});

test("@ui-note-editor-modes desktop split mode reads as one workbench", async ({ page }) => {
  await page.setViewportSize(desktopViewport);
  await signIn(page);
  await page.goto(`/app/notes/${seededNoteId}/edit`);

  await expect(page.getByRole("heading", { name: "Edit draft note" })).toBeVisible();
  await expect(page.getByTestId("note-editor-mode-switcher")).toBeVisible();
  await expect(page.getByRole("button", { name: "Split" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByTestId("note-editor-source-pane")).toBeVisible();
  await expect(page.getByTestId("note-editor-preview-pane")).toBeVisible();
  await expect(page.getByTestId("note-markdown-preview")).toContainText("Keep preview continuity");
  await expectSplitWorkbenchLayout(page, "desktop");
  await expectAccessibleStructure(page);
  await expectNoHorizontalOverflow(page);

  await expect(page.locator(".note-editor-shell")).toHaveScreenshot("ui-note-editor-modes-desktop.png", {
    animations: "disabled"
  });
});

test("@ui-note-editor-modes mobile uses an edit and preview workflow without split-pane compression", async ({ page }) => {
  await page.setViewportSize(mobileViewport);
  await signIn(page);
  await page.goto(`/app/notes/${seededNoteId}/edit`);

  const editor = page.getByTestId("note-markdown-input");
  const modeSwitcher = page.getByTestId("note-editor-mode-switcher");
  const editButton = modeSwitcher.getByRole("button", { name: "Edit" });
  const previewButton = modeSwitcher.getByRole("button", { name: "Preview" });
  const sourcePane = page.getByTestId("note-editor-source-pane");
  const previewPane = page.getByTestId("note-editor-preview-pane");

  await expect(page.getByRole("heading", { name: "Edit draft note" })).toBeVisible();
  await expect(modeSwitcher).toBeVisible();
  await expect(editButton).toHaveAttribute("aria-pressed", "true");
  await expect(sourcePane).toBeVisible();
  await expect(previewPane).toBeHidden();

  await editor.click();
  await editor.press("End");
  await editor.press("Enter");
  await editor.type("Mobile keeps the workbench readable");
  await expect(editor).toHaveValue(/Mobile keeps the workbench readable/);

  await previewButton.click();
  await expect(previewButton).toHaveAttribute("aria-pressed", "true");
  await expect(sourcePane).toBeHidden();
  await expect(previewPane).toBeVisible();
  await expect(page.getByTestId("note-markdown-preview")).toContainText("Mobile keeps the workbench readable");

  await editButton.click();
  await expect(editButton).toHaveAttribute("aria-pressed", "true");
  await expect(sourcePane).toBeVisible();
  await expect(previewPane).toBeHidden();
  await expect(editor).toBeFocused();
  await page.keyboard.press("Enter");
  await page.keyboard.type("Returns to editing cleanly");
  await expect(editor).toHaveValue(/Returns to editing cleanly/);

  await page.getByRole("button", { name: "Save draft" }).click();
  await expect(page).toHaveURL(/\/app\/notes\/[^/]+\/edit\?saved=1$/);
  await expect(page.getByText("Draft saved.")).toBeVisible();
  await expect(page.getByTestId("note-markdown-input")).toHaveValue(/Returns to editing cleanly/);
  await expectAccessibleStructure(page);
  await expectNoHorizontalOverflow(page);

  await expect(page.locator(".note-editor-shell")).toHaveScreenshot("ui-note-editor-modes-mobile.png", {
    animations: "disabled"
  });
});
