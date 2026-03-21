import "dotenv/config";

import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";
import { expect, test, type Page } from "@playwright/test";

const desktopViewport = { width: 1440, height: 900 };
const mobileViewport = { width: 390, height: 844 };

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL must be set before running note editor foundation UI tests.");
}

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({
    url: databaseUrl
  })
});

const seededNote = {
  title: "Workbench foundation keeps markdown as the source",
  slug: "workbench-foundation-keeps-markdown-as-the-source",
  markdown: `# Workbench foundation keeps markdown as the source

Source editing should feel deliberate without hiding the syntax.

- Keep preview and source aligned
- Keep the markdown body canonical
- Keep note publishing unchanged`,
  excerpt: "Source editing should feel deliberate without hiding the syntax or changing the saved note body.",
  summary: "A stronger note editor should improve raw markdown authoring while leaving the persisted note model alone.",
  enrichmentStatus: "ready",
  enrichmentError: null,
  enrichmentAttempts: 1,
  enrichmentUpdatedAt: new Date("2024-05-21T09:00:00.000Z"),
  isPublished: true,
  publishedAt: new Date("2024-05-21T09:05:00.000Z"),
  updatedAt: new Date("2024-05-21T09:05:00.000Z"),
  tags: ["editor", "markdown", "workbench"]
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
    throw new Error(`Owner account '${username}' must exist before note editor foundation UI tests run.`);
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

async function expectWorkbenchHierarchy(page: Page, viewport: "desktop" | "mobile") {
  const form = page.locator(".note-form");
  const preview = page.locator(".note-preview-panel");
  const workbench = page.getByTestId("note-markdown-workbench");

  const [formBox, previewBox, workbenchBox] = await Promise.all([form.boundingBox(), preview.boundingBox(), workbench.boundingBox()]);

  expect(formBox).not.toBeNull();
  expect(previewBox).not.toBeNull();
  expect(workbenchBox).not.toBeNull();

  if (!formBox || !previewBox || !workbenchBox) {
    return;
  }

  expect(workbenchBox.height).toBeGreaterThan(viewport === "desktop" ? 350 : 300);

  if (viewport === "desktop") {
    expect(formBox.x).toBeLessThan(previewBox.x);
    expect(formBox.width).toBeGreaterThan(previewBox.width);
    return;
  }

  expect(previewBox.y).toBeGreaterThan(formBox.y);
}

test.describe.configure({ mode: "serial" });

let seededNoteId = "";

test.beforeEach(async () => {
  seededNoteId = await seedEditableNote();
});

test.afterAll(async () => {
  await prisma.$disconnect();
});

test("@ui-note-editor-foundation source-first authoring keeps markdown preview and save flow intact", async ({ page }) => {
  await page.setViewportSize(desktopViewport);
  await signIn(page);
  await page.goto("/app/notes/new");

  await expect(page.getByRole("heading", { name: "New draft note" })).toBeVisible();
  await expect(page.getByTestId("note-markdown-workbench")).toBeVisible();
  await expect(page.locator(".note-editor-gutter-track span").first()).toHaveText("01");

  await page.getByRole("textbox", { name: "Title" }).fill("Source-first editor foundation");

  const editor = page.getByTestId("note-markdown-input");
  await editor.click();
  await editor.fill("# Source-first editor foundation\n\n- Syntax-aware editing");
  await editor.press("End");
  await editor.press("Enter");
  await editor.type("Preserves markdown preview");

  await expect(editor).toHaveValue("# Source-first editor foundation\n\n- Syntax-aware editing\n- Preserves markdown preview");
  await expect(page.getByTestId("note-markdown-preview")).toContainText("Source-first editor foundation");
  await expect(page.getByTestId("note-markdown-preview")).toContainText("Preserves markdown preview");

  await page.getByRole("button", { name: "Create draft" }).click();

  await expect(page).toHaveURL(/\/app\/notes\/[^/]+\/edit\?saved=1$/);
  await expect(page.getByText("Draft saved.")).toBeVisible();
  await expect(page.getByTestId("note-markdown-input")).toHaveValue(
    "# Source-first editor foundation\n\n- Syntax-aware editing\n- Preserves markdown preview"
  );
  await expect(page.getByTestId("note-markdown-preview")).toContainText("Preserves markdown preview");
});

test("@ui-note-editor-foundation desktop workbench looks upgraded without breaking edit layout", async ({ page }) => {
  await page.setViewportSize(desktopViewport);
  await signIn(page);
  await page.goto(`/app/notes/${seededNoteId}/edit`);

  await expect(page.getByRole("heading", { name: "Edit draft note" })).toBeVisible();
  await expect(page.getByTestId("note-markdown-workbench")).toBeVisible();
  await expect(page.locator(".note-editor-toolbar")).toContainText("Markdown source");
  await expect(page.locator(".note-editor-statusbar")).toContainText("lines");
  await expect(page.locator(".note-preview-panel .section-heading").filter({ hasText: "Preview" })).toBeVisible();
  await expect(page.getByTestId("note-markdown-preview")).toContainText("Keep note publishing unchanged");
  await expectWorkbenchHierarchy(page, "desktop");
  await expectAccessibleStructure(page);
  await expectNoHorizontalOverflow(page);

  await expect(page.locator(".note-editor-shell")).toHaveScreenshot("ui-note-editor-foundation-desktop.png", {
    animations: "disabled"
  });
});

test("@ui-note-editor-foundation mobile workbench stays readable and stacked", async ({ page }) => {
  await page.setViewportSize(mobileViewport);
  await signIn(page);
  await page.goto(`/app/notes/${seededNoteId}/edit`);

  await expect(page.getByRole("heading", { name: "Edit draft note" })).toBeVisible();
  await expect(page.getByTestId("note-markdown-workbench")).toBeVisible();
  await expect(page.getByTestId("note-markdown-input")).toBeVisible();
  await expect(page.locator(".note-editor-statusbar")).toContainText("chars");
  await expectWorkbenchHierarchy(page, "mobile");
  await expectAccessibleStructure(page);
  await expectNoHorizontalOverflow(page);

  await expect(page.locator(".note-editor-shell")).toHaveScreenshot("ui-note-editor-foundation-mobile.png", {
    animations: "disabled"
  });
});
