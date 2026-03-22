import "dotenv/config";

import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";
import { expect, test, type Locator, type Page } from "@playwright/test";

const desktopViewport = { width: 1440, height: 900 };
const mobileViewport = { width: 390, height: 844 };
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL must be set before running public home density UI tests.");
}

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({
    url: databaseUrl
  })
});

const seededPublishedNotes = [
  {
    title: "Showroom priority note",
    slug: "showroom-priority-note",
    markdown: "# Showroom priority note",
    excerpt: "The first screen should expose real published work instead of an explanatory wall of copy.",
    summary: "A denser public shell lets the archive explain itself.",
    publishedAt: new Date("2024-08-12T09:30:00.000Z"),
    tags: ["showroom", "density"]
  },
  {
    title: "Archive rhythm stays visible",
    slug: "archive-rhythm-stays-visible",
    markdown: "# Archive rhythm stays visible",
    excerpt: "Tight framing makes room for actual notes and links in the opening viewport.",
    summary: null,
    publishedAt: new Date("2024-08-10T09:30:00.000Z"),
    tags: ["rhythm"]
  }
] as const;

const seededPublishedLinks = [
  {
    title: "Published link without intro bloat",
    url: "https://example.com/published-link-without-intro-bloat",
    summary: "The public homepage should reveal mixed content immediately.",
    publishedAt: new Date("2024-08-11T09:30:00.000Z"),
    tags: ["links", "showroom"]
  },
  {
    title: "First screen content density reference",
    url: "https://example.com/first-screen-content-density-reference",
    summary: "Visitors should see cards before they need to scroll.",
    publishedAt: new Date("2024-08-09T09:30:00.000Z"),
    tags: ["density"]
  }
] as const;

async function seedPublicShowroomContent() {
  const username = process.env.OWNER_USERNAME ?? "owner";
  const owner = await prisma.user.findUnique({
    where: {
      username
    }
  });

  if (!owner) {
    throw new Error(`Owner account '${username}' must exist before public home density UI tests run.`);
  }

  await prisma.link.deleteMany({
    where: {
      ownerId: owner.id
    }
  });

  await prisma.note.deleteMany({
    where: {
      ownerId: owner.id
    }
  });

  for (const note of seededPublishedNotes) {
    await prisma.note.create({
      data: {
        ownerId: owner.id,
        title: note.title,
        slug: note.slug,
        markdown: note.markdown,
        excerpt: note.excerpt,
        summary: note.summary,
        enrichmentStatus: "ready",
        isPublished: true,
        publishedAt: note.publishedAt,
        createdAt: note.publishedAt,
        updatedAt: note.publishedAt,
        tags: {
          connectOrCreate: note.tags.map((tag) => ({
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

  for (const link of seededPublishedLinks) {
    await prisma.link.create({
      data: {
        ownerId: owner.id,
        title: link.title,
        url: link.url,
        summary: link.summary,
        enrichmentStatus: "ready",
        isPublished: true,
        publishedAt: link.publishedAt,
        createdAt: link.publishedAt,
        updatedAt: link.publishedAt,
        tags: {
          connectOrCreate: link.tags.map((tag) => ({
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

async function getBox(locator: Locator) {
  const box = await locator.boundingBox();

  expect(box).not.toBeNull();

  return box!;
}

async function expectFirstScreenShowroomPresence(page: Page, viewportHeight: number, minimumVisibleHeight: number) {
  const shellHeadBox = await getBox(page.locator(".public-home-shell-head"));
  const sectionHeadingBox = await getBox(page.locator(".note-collection-panel .section-heading"));
  const firstCardBox = await getBox(page.locator("[data-testid='public-home-showroom'] .note-preview-card").first());

  expect(shellHeadBox.y).toBeLessThan(sectionHeadingBox.y);
  expect(sectionHeadingBox.y).toBeLessThan(firstCardBox.y);
  expect(firstCardBox.y).toBeLessThan(viewportHeight);
  expect(firstCardBox.y + minimumVisibleHeight).toBeLessThan(viewportHeight);
}

async function expectExpandedSearchState(page: Page, viewportHeight: number, minimumVisibleHeight: number) {
  const closeSearchButton = page.getByRole("button", { name: "Close public title search" });
  const searchInput = page.getByRole("searchbox", { name: "Search public titles" });
  const firstCardBox = await getBox(page.locator("[data-testid='public-home-showroom'] .note-preview-card").first());

  await expect(closeSearchButton).toBeVisible();
  await expect(closeSearchButton).toHaveAttribute("aria-expanded", "true");
  await expect(searchInput).toBeVisible();
  await expect(searchInput).toBeFocused();
  await expect(page.getByTestId("public-home-search-summary")).toHaveText("Showing all 4 public items.");
  expect(firstCardBox.y).toBeLessThan(viewportHeight);
  expect(firstCardBox.y + minimumVisibleHeight).toBeLessThan(viewportHeight);
}

test.describe.configure({ mode: "serial" });

test.beforeEach(async () => {
  await seedPublicShowroomContent();
});

test.afterAll(async () => {
  await prisma.$disconnect();
});

test("@ui-regression @ui-public-home-density @ui-public-showroom-masonry @ui-public-taste-regression public homepage keeps published cards in the first desktop screen", async ({ page }) => {
  await page.setViewportSize(desktopViewport);
  await page.goto("/");

  const searchToggle = page.getByRole("button", { name: "Open public title search" });

  await expect(page.locator("[data-testid='public-home-showroom'] .note-preview-card")).toHaveCount(
    seededPublishedNotes.length + seededPublishedLinks.length
  );
  await expect(page.getByRole("heading", { name: "Published notes and links" })).toBeVisible();
  await expect(page.locator(".public-intro-panel .lede")).toHaveCount(0);
  await expect(page.getByTestId("public-home-search-toggle")).toBeVisible();
  await expect(searchToggle).toHaveAttribute("aria-expanded", "false");
  await expectFirstScreenShowroomPresence(page, desktopViewport.height, 88);
  await expectAccessibleStructure(page);
  await expectNoHorizontalOverflow(page);

  await expect(page.getByTestId("public-home-layout")).toHaveScreenshot("ui-public-home-density-desktop.png", {
    animations: "disabled",
    maxDiffPixelRatio: 0.02
  });

  await searchToggle.click();
  await expectExpandedSearchState(page, desktopViewport.height, 48);
  await expectAccessibleStructure(page);
  await expectNoHorizontalOverflow(page);

  await page.getByRole("button", { name: "Close public title search" }).click();
  await expect(searchToggle).toBeVisible();
  await expect(searchToggle).toHaveAttribute("aria-expanded", "false");
  await expectFirstScreenShowroomPresence(page, desktopViewport.height, 88);
});

test("@ui-regression @ui-public-home-density @ui-public-showroom-masonry @ui-responsive @ui-public-taste-regression public homepage keeps published cards in the first mobile screen", async ({ page }) => {
  await page.setViewportSize(mobileViewport);
  await page.goto("/");

  const searchToggle = page.getByRole("button", { name: "Open public title search" });

  await expect(page.locator("[data-testid='public-home-showroom'] .note-preview-card")).toHaveCount(
    seededPublishedNotes.length + seededPublishedLinks.length
  );
  await expect(page.getByRole("heading", { name: "Published notes and links" })).toBeVisible();
  await expect(page.locator(".public-intro-panel .lede")).toHaveCount(0);
  await expect(page.getByTestId("public-home-search-toggle")).toBeVisible();
  await expect(searchToggle).toHaveAttribute("aria-expanded", "false");
  await expectFirstScreenShowroomPresence(page, mobileViewport.height, 64);
  await expectAccessibleStructure(page);
  await expectNoHorizontalOverflow(page);

  await expect(page.getByTestId("public-home-layout")).toHaveScreenshot("ui-public-home-density-mobile.png", {
    animations: "disabled",
    maxDiffPixelRatio: 0.02
  });

  await searchToggle.click();
  await expectExpandedSearchState(page, mobileViewport.height, 24);
  await expectAccessibleStructure(page);
  await expectNoHorizontalOverflow(page);

  await page.getByRole("button", { name: "Close public title search" }).click();
  await expect(searchToggle).toBeVisible();
  await expect(searchToggle).toHaveAttribute("aria-expanded", "false");
  await expectFirstScreenShowroomPresence(page, mobileViewport.height, 64);
});
