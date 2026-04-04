import "dotenv/config";

import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";
import { expect, test, type Page } from "@playwright/test";

const desktopViewport = { width: 1440, height: 900 };
const mobileViewport = { width: 390, height: 844 };
const modKey = process.platform === "darwin" ? "Meta" : "Control";

const databaseUrl = process.env.DATABASE_URL?.startsWith("file:./")
  ? "file:" + process.cwd() + "/" + process.env.DATABASE_URL.slice("file:./".length)
  : process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL must be set before running note editor toolbar UI tests.");
}

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({
    url: databaseUrl
  })
});

const seededNote = {
  title: "Toolbar actions should stay compact",
  slug: "toolbar-actions-should-stay-compact",
  markdown: `## Toolbar actions should stay compact

Formatting helpers should stay source-first and predictable.

- Keep the toolbar compact
- Keep markdown visible
- Keep shortcuts natural`,
  excerpt: "Compact formatting helpers should speed up note writing without introducing a second editor model.",
  summary: "A compact toolbar should accelerate common markdown transforms while leaving source editing in control.",
  enrichmentStatus: "ready",
  enrichmentError: null,
  enrichmentAttempts: 1,
  enrichmentUpdatedAt: new Date("2024-05-24T10:00:00.000Z"),
  isPublished: false,
  publishedAt: null,
  updatedAt: new Date("2024-05-24T10:05:00.000Z"),
  tags: ["toolbar", "markdown", "shortcuts"]
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
    throw new Error(`Owner account '${username}' must exist before note editor toolbar UI tests run.`);
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

async function setEditorSelection(page: Page, start: number, end: number) {
  await page.evaluate(
    ({ end: nextEnd, start: nextStart }) => {
      const textarea = document.querySelector<HTMLTextAreaElement>("[data-testid='note-markdown-input']");

      if (!textarea) {
        throw new Error("Expected note markdown textarea to exist.");
      }

      textarea.focus();
      textarea.setSelectionRange(nextStart, nextEnd);
      textarea.dispatchEvent(new Event("select", { bubbles: true }));
    },
    { end, start }
  );
}

async function getEditorSelection(page: Page) {
  return page.evaluate(() => {
    const textarea = document.querySelector<HTMLTextAreaElement>("[data-testid='note-markdown-input']");

    if (!textarea) {
      throw new Error("Expected note markdown textarea to exist.");
    }

    return {
      end: textarea.selectionEnd,
      start: textarea.selectionStart
    };
  });
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

test.describe.configure({ mode: "serial" });

let seededNoteId = "";

test.beforeEach(async () => {
  seededNoteId = await seedEditableNote();
});

test.afterAll(async () => {
  await prisma.$disconnect();
});

test("@ui-note-editor-toolbar toolbar actions and shortcuts transform markdown predictably", async ({ page }) => {
  await page.setViewportSize(desktopViewport);
  await signIn(page);
  await page.goto("/app/notes/new");

  const editor = page.getByTestId("note-markdown-input");
  const toolbar = page.getByTestId("note-editor-toolbar");

  await expect(toolbar).toBeVisible();
  await expect(toolbar.getByRole("button", { name: "Heading markdown" })).toBeVisible();
  await expect(toolbar.getByRole("button", { name: "Link markdown" })).toBeVisible();
  await expect(page.locator(".note-editor-highlight")).toHaveCount(0);

  const editorStyles = await editor.evaluate((element) => {
    const styles = getComputedStyle(element);

    return {
      color: styles.color,
      textFill: styles.getPropertyValue("-webkit-text-fill-color").trim()
    };
  });

  expect(editorStyles.color).not.toBe("rgba(0, 0, 0, 0)");
  expect(editorStyles.textFill).not.toBe("transparent");

  await editor.fill("section");
  await setEditorSelection(page, 0, 7);
  await toolbar.getByRole("button", { name: "Heading markdown" }).click();
  await expect(editor).toHaveValue("## section");

  await page.keyboard.press(`${modKey}+Alt+2`);
  await expect(editor).toHaveValue("section");

  await editor.fill("alpha");
  await setEditorSelection(page, 0, 5);
  await page.keyboard.press(`${modKey}+B`);
  await expect(editor).toHaveValue("**alpha**");

  await editor.fill("beta");
  await setEditorSelection(page, 0, 4);
  await page.keyboard.press(`${modKey}+I`);
  await expect(editor).toHaveValue("*beta*");

  await editor.fill("gamma");
  await setEditorSelection(page, 0, 5);
  await page.keyboard.press(`${modKey}+K`);
  await expect(editor).toHaveValue("[gamma](https://)");

  await editor.fill("one\ntwo");
  await setEditorSelection(page, 0, 7);
  await toolbar.getByRole("button", { name: "Bullet list markdown" }).click();
  await expect(editor).toHaveValue("- one\n- two");
  await toolbar.getByRole("button", { name: "Bullet list markdown" }).click();
  await expect(editor).toHaveValue("one\ntwo");

  await editor.fill("first\nsecond");
  await setEditorSelection(page, 0, 12);
  await toolbar.getByRole("button", { name: "Numbered list markdown" }).click();
  await expect(editor).toHaveValue("1. first\n2. second");

  await editor.fill("quoted text");
  await setEditorSelection(page, 0, 11);
  await toolbar.getByRole("button", { name: "Quote markdown" }).click();
  await expect(editor).toHaveValue("> quoted text");

  await editor.fill("const total = 1;");
  await setEditorSelection(page, 0, 16);
  await toolbar.getByRole("button", { name: "Code block markdown" }).click();
  await expect(editor).toHaveValue("```\nconst total = 1;\n```");

  await editor.fill("");
  await setEditorSelection(page, 0, 0);
  await toolbar.getByRole("button", { name: "Code block markdown" }).click();
  await expect(editor).toHaveValue("```\n\n```");
  await expect(await getEditorSelection(page)).toEqual({ end: 4, start: 4 });
});

test("@ui-note-editor-toolbar desktop toolbar stays compact without breaking hierarchy", async ({ page }) => {
  await page.setViewportSize(desktopViewport);
  await signIn(page);
  await page.goto(`/app/notes/${seededNoteId}/edit`);

  await expect(page.getByRole("heading", { name: "Edit draft note" })).toBeVisible();
  await expect(page.getByTestId("note-markdown-workbench")).toBeVisible();
  await expect(page.getByTestId("note-editor-toolbar").getByRole("button")).toHaveCount(12);
  await expect(page.locator(".note-editor-statusbar")).toContainText("lines");
  await expect(page.getByTestId("note-markdown-preview")).toContainText("Keep shortcuts natural");
  await expectAccessibleStructure(page);
  await expectNoHorizontalOverflow(page);

  await expect(page.locator(".note-editor-shell")).toHaveScreenshot("ui-note-editor-toolbar-desktop.png", {
    animations: "disabled"
  });
});

test("@ui-note-editor-toolbar mobile toolbar wraps cleanly and keeps actions reachable", async ({ page }) => {
  await page.setViewportSize(mobileViewport);
  await signIn(page);
  await page.goto(`/app/notes/${seededNoteId}/edit`);

  await expect(page.getByRole("heading", { name: "Edit draft note" })).toBeVisible();
  await expect(page.getByTestId("note-markdown-workbench")).toBeVisible();
  await expect(page.getByTestId("note-editor-toolbar")).toBeVisible();
  await expect(page.getByTestId("note-editor-toolbar").getByRole("button", { name: "Bold markdown" })).toBeVisible();
  await expect(page.getByTestId("note-editor-toolbar").getByRole("button", { name: "Link markdown" })).toBeVisible();
  await expectAccessibleStructure(page);
  await expectNoHorizontalOverflow(page);

  await expect(page.locator(".note-editor-shell")).toHaveScreenshot("ui-note-editor-toolbar-mobile.png", {
    animations: "disabled"
  });
});
