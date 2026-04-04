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
  throw new Error("DATABASE_URL must be set before running UI public note math tests.");
}

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({
    url: databaseUrl
  })
});

const seededNote = {
  title: "Published note math should stay readable",
  slug: "published-note-math-should-stay-readable",
  markdown: `Inline math keeps context close: $e^{i\\pi} + 1 = 0$.

$$
\\int_0^1 x^2 \\, dx
$$`,
  summary: "Published notes should render inline and block LaTeX without exposing raw delimiters or causing mobile overflow.",
  publishedAt: new Date("2024-05-29T09:30:00.000Z"),
  tags: ["math", "public notes"]
} as const;

async function seedPublishedNote() {
  const username = process.env.OWNER_USERNAME ?? "owner";
  const owner = await prisma.user.findUnique({
    where: {
      username
    }
  });

  if (!owner) {
    throw new Error(`Owner account '${username}' must exist before UI public note math tests run.`);
  }

  await prisma.note.deleteMany({
    where: {
      ownerId: owner.id
    }
  });

  await prisma.note.create({
    data: {
      ownerId: owner.id,
      title: seededNote.title,
      slug: seededNote.slug,
      markdown: seededNote.markdown,
      excerpt: "Published notes should render both inline and block math cleanly.",
      summary: seededNote.summary,
      enrichmentStatus: "ready",
      isPublished: true,
      publishedAt: seededNote.publishedAt,
      tags: {
        connectOrCreate: seededNote.tags.map((tag) => ({
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
        issues.push(`unnamed:${element.tagName.toLowerCase()}`);
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

test.describe.configure({ mode: "serial" });

test.beforeEach(async () => {
  await seedPublishedNote();
});

test.afterAll(async () => {
  await prisma.$disconnect();
});

test("@ui-public-note-math published note renders math cleanly on desktop", async ({ page }) => {
  await page.setViewportSize(desktopViewport);
  await page.goto(`/notes/${seededNote.slug}`);

  const noteBody = page.getByTestId("public-note-markdown");

  await expect(page.getByRole("heading", { name: seededNote.title })).toBeVisible();
  await expect(noteBody.locator(".katex")).toHaveCount(2);
  await expect(noteBody.locator(".katex-display")).toHaveCount(1);
  await expect(noteBody).not.toContainText("$$");
  await expect(page.getByText(seededNote.summary)).toBeVisible();
  await expectAccessibleStructure(page);
  await expectNoHorizontalOverflow(page);

  await expect(page.locator(".public-note-card")).toHaveScreenshot("ui-public-note-math-desktop.png", {
    animations: "disabled"
  });
});

test("@ui-public-note-math published note keeps math readable on mobile", async ({ page }) => {
  await page.setViewportSize(mobileViewport);
  await page.goto(`/notes/${seededNote.slug}`);

  const noteBody = page.getByTestId("public-note-markdown");

  await expect(page.getByRole("heading", { name: seededNote.title })).toBeVisible();
  await expect(noteBody.locator(".katex")).toHaveCount(2);
  await expect(noteBody.locator(".katex-display")).toHaveCount(1);
  await expect(noteBody).not.toContainText("$$");
  await expectAccessibleStructure(page);
  await expectNoHorizontalOverflow(page);

  await expect(page.locator(".public-note-card")).toHaveScreenshot("ui-public-note-math-mobile.png", {
    animations: "disabled"
  });
});
