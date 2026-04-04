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
  throw new Error("DATABASE_URL must be set before running owner secondary UI tests.");
}

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({
    url: databaseUrl
  })
});

const seededNotes = [
  {
    title: "Studio density guide for the private vault",
    slug: "studio-density-guide-for-the-private-vault",
    markdown: "# Studio density guide for the private vault",
    excerpt: "Secondary owner routes should inherit the same tighter rhythm as the dashboard instead of expanding into oversized standalone cards.",
    summary: "A tighter owner system keeps retrieval fast by giving titles, excerpts, and metadata clear lanes instead of competing slabs.",
    enrichmentStatus: "ready",
    enrichmentError: null,
    enrichmentAttempts: 1,
    enrichmentUpdatedAt: new Date("2024-06-12T09:00:00.000Z"),
    isPublished: true,
    publishedAt: new Date("2024-06-12T09:05:00.000Z"),
    updatedAt: new Date("2024-06-12T09:05:00.000Z"),
    tags: ["studio-systems", "retrieval-rhythm"]
  },
  {
    title: "Compact retrieval keeps similar drafts distinguishable",
    slug: "compact-retrieval-keeps-similar-drafts-distinguishable",
    markdown: "# Compact retrieval keeps similar drafts distinguishable",
    excerpt: "A denser layout still needs enough note context to keep similar work items recognizable before reopening them.",
    summary: "Retrieval clarity comes from preserving authored anchors even while reducing bulk across the owner workspace.",
    enrichmentStatus: "pending",
    enrichmentError: null,
    enrichmentAttempts: 1,
    enrichmentUpdatedAt: new Date("2024-06-10T15:10:00.000Z"),
    isPublished: false,
    publishedAt: null,
    updatedAt: new Date("2024-06-10T15:10:00.000Z"),
    tags: ["retrieval-rhythm", "drafts"]
  }
] as const;

const seededLinks = [
  {
    title: "Reference shelf field study",
    url: "https://example.com/reference-shelf-field-study",
    summary: "A field study showing how compact secondary routes can keep saved references and AI metadata visible without turning into large standalone cards.",
    enrichmentStatus: "ready",
    enrichmentError: null,
    enrichmentAttempts: 1,
    enrichmentUpdatedAt: new Date("2024-06-13T08:40:00.000Z"),
    isPublished: true,
    publishedAt: new Date("2024-06-13T08:45:00.000Z"),
    updatedAt: new Date("2024-06-13T08:40:00.000Z"),
    tags: ["studio-systems", "retrieval-rhythm"]
  },
  {
    title: "Responsive tag filtering notes",
    url: "https://example.com/responsive-tag-filtering-notes",
    summary: null,
    enrichmentStatus: "pending",
    enrichmentError: null,
    enrichmentAttempts: 1,
    enrichmentUpdatedAt: new Date("2024-06-11T17:25:00.000Z"),
    isPublished: false,
    publishedAt: null,
    updatedAt: new Date("2024-06-11T17:25:00.000Z"),
    tags: ["responsive-ui"]
  },
  {
    title: "Owner retrieval error handling reference",
    url: "https://example.com/owner-retrieval-error-handling",
    summary: null,
    enrichmentStatus: "failed",
    enrichmentError: "The Mina AI endpoint timed out.",
    enrichmentAttempts: 2,
    enrichmentUpdatedAt: new Date("2024-06-09T11:20:00.000Z"),
    isPublished: false,
    publishedAt: null,
    updatedAt: new Date("2024-06-09T11:20:00.000Z"),
    tags: []
  }
] as const;

function getOwnerCredentials() {
  return {
    username: process.env.OWNER_USERNAME ?? "owner",
    password: process.env.OWNER_PASSWORD ?? "password"
  };
}

async function seedOwnerSecondaryContent() {
  const { username } = getOwnerCredentials();
  const owner = await prisma.user.findUnique({
    where: {
      username
    }
  });

  if (!owner) {
    throw new Error(`Owner account '${username}' must exist before owner secondary UI tests run.`);
  }

  await prisma.note.deleteMany({
    where: {
      ownerId: owner.id
    }
  });

  await prisma.link.deleteMany({
    where: {
      ownerId: owner.id
    }
  });

  for (const note of seededNotes) {
    await prisma.note.create({
      data: {
        ownerId: owner.id,
        title: note.title,
        slug: note.slug,
        markdown: note.markdown,
        excerpt: note.excerpt,
        summary: note.summary,
        enrichmentStatus: note.enrichmentStatus,
        enrichmentError: note.enrichmentError,
        enrichmentAttempts: note.enrichmentAttempts,
        enrichmentUpdatedAt: note.enrichmentUpdatedAt,
        isPublished: note.isPublished,
        publishedAt: note.publishedAt,
        createdAt: note.updatedAt,
        updatedAt: note.updatedAt,
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

  for (const link of seededLinks) {
    await prisma.link.create({
      data: {
        ownerId: owner.id,
        title: link.title,
        url: link.url,
        summary: link.summary,
        enrichmentStatus: link.enrichmentStatus,
        enrichmentError: link.enrichmentError,
        enrichmentAttempts: link.enrichmentAttempts,
        enrichmentUpdatedAt: link.enrichmentUpdatedAt,
        isPublished: link.isPublished,
        publishedAt: link.publishedAt,
        createdAt: link.updatedAt,
        updatedAt: link.updatedAt,
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

async function expectMatchedSurfaceWidths(page: Page, selectors: string[]) {
  const widths = await page.evaluate((targets) => {
    return targets.map((selector) => {
      const element = document.querySelector<HTMLElement>(selector);

      if (!element) {
        return null;
      }

      return element.getBoundingClientRect().width;
    });
  }, selectors);

  const numericWidths = widths.filter((width): width is number => typeof width === "number");

  expect(numericWidths).toHaveLength(selectors.length);

  if (numericWidths.length < selectors.length) {
    return;
  }

  const widest = Math.max(...numericWidths);
  const narrowest = Math.min(...numericWidths);

  expect(widest - narrowest).toBeLessThanOrEqual(8);
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

async function expectLinksHierarchy(page: Page, viewport: "desktop" | "mobile") {
  const hero = page.locator(".secondary-route-hero");
  const form = page.locator(".secondary-control-panel");
  const listPanel = page.locator(".secondary-link-panel");
  const firstLink = page.locator(".secondary-link-item").first();

  const [heroBox, formBox, listBox, linkBox] = await Promise.all([
    hero.boundingBox(),
    form.boundingBox(),
    listPanel.boundingBox(),
    firstLink.boundingBox()
  ]);

  expect(heroBox).not.toBeNull();
  expect(formBox).not.toBeNull();
  expect(listBox).not.toBeNull();
  expect(linkBox).not.toBeNull();

  if (!heroBox || !formBox || !listBox || !linkBox) {
    return;
  }

  expect(heroBox.height).toBeLessThan(viewport === "desktop" ? 340 : 500);
  expect(formBox.height).toBeLessThan(viewport === "desktop" ? 320 : 420);
  expect(linkBox.height).toBeLessThan(viewport === "desktop" ? 390 : 470);

  if (viewport === "desktop") {
    expect(formBox.y).toBeLessThan(listBox.y);
    expect(Math.abs(formBox.x - listBox.x)).toBeLessThan(24);
    expect(Math.abs(listBox.width - formBox.width)).toBeLessThanOrEqual(8);
    return;
  }

  expect(listBox.y).toBeGreaterThan(formBox.y);
  expect(Math.abs(listBox.width - formBox.width)).toBeLessThan(48);
}

async function expectTagsHierarchy(page: Page, viewport: "desktop" | "mobile") {
  const hero = page.locator(".secondary-route-hero");
  const filters = page.locator(".secondary-filter-panel");
  const notes = page.locator(".secondary-note-panel");
  const links = page.locator(".secondary-link-panel");

  const [heroBox, filterBox, notesBox, linksBox] = await Promise.all([
    hero.boundingBox(),
    filters.boundingBox(),
    notes.boundingBox(),
    links.boundingBox()
  ]);

  expect(heroBox).not.toBeNull();
  expect(filterBox).not.toBeNull();
  expect(notesBox).not.toBeNull();
  expect(linksBox).not.toBeNull();

  if (!heroBox || !filterBox || !notesBox || !linksBox) {
    return;
  }

  expect(heroBox.height).toBeLessThan(viewport === "desktop" ? 340 : 500);
  expect(filterBox.height).toBeLessThan(viewport === "desktop" ? 300 : 560);

  if (viewport === "desktop") {
    expect(notesBox.x).toBeLessThan(linksBox.x);
    expect(Math.abs(notesBox.width - linksBox.width)).toBeLessThan(120);
    return;
  }

  expect(linksBox.y).toBeGreaterThan(notesBox.y);
}

async function expectSearchHierarchy(page: Page, viewport: "desktop" | "mobile") {
  const hero = page.locator(".secondary-route-hero");
  const form = page.locator(".secondary-search-form");
  const notes = page.locator(".secondary-note-panel");
  const links = page.locator(".secondary-link-panel");

  const [heroBox, formBox, notesBox, linksBox] = await Promise.all([
    hero.boundingBox(),
    form.boundingBox(),
    notes.boundingBox(),
    links.boundingBox()
  ]);

  expect(heroBox).not.toBeNull();
  expect(formBox).not.toBeNull();
  expect(notesBox).not.toBeNull();
  expect(linksBox).not.toBeNull();

  if (!heroBox || !formBox || !notesBox || !linksBox) {
    return;
  }

  expect(heroBox.height).toBeLessThan(viewport === "desktop" ? 320 : 500);
  expect(formBox.height).toBeLessThan(viewport === "desktop" ? 260 : 300);

  if (viewport === "desktop") {
    expect(notesBox.x).toBeLessThan(linksBox.x);
    return;
  }

  expect(linksBox.y).toBeGreaterThan(notesBox.y);
}

test.describe.configure({ mode: "serial" });

test.beforeEach(async () => {
  await seedOwnerSecondaryContent();
});

test.afterAll(async () => {
  await prisma.$disconnect();
});

test("@ui-regression @ui-refinement-hardening @ui-owner-secondary @ui-owner-links-layout links surface gives the saved list the dominant desktop lane", async ({ page }) => {
  await page.setViewportSize(desktopViewport);
  await signIn(page);
  await page.goto("/app/links");

  await expect(page.getByRole("heading", { name: "Reference shelf" })).toBeVisible();
  await expect(page.locator('[aria-label="Links overview"]')).toBeVisible();
  await expect(page.locator(".secondary-link-panel .section-heading").getByText("Saved links")).toBeVisible();
  await expect(page.getByRole("button", { name: "Save link" })).toBeVisible();
  await expect(page.locator(".secondary-link-item")).toHaveCount(seededLinks.length);
  await expect(page.getByRole("button", { exact: true, name: "Publish link" })).toHaveCount(2);
  await expect(page.getByRole("button", { exact: true, name: "Unpublish link" })).toHaveCount(1);
  await expect(page.getByRole("button", { name: "Retry AI enrichment" })).toBeVisible();
  await expectLinksHierarchy(page, "desktop");
  await expectMatchedSurfaceWidths(page, [".secondary-route-hero", ".secondary-control-panel", ".secondary-link-panel"]);
  await expectAccessibleStructure(page);
  await expectNoHorizontalOverflow(page);

  await expect(page.locator(".feature-layout")).toHaveScreenshot("ui-owner-secondary-links-desktop.png", {
    animations: "disabled"
  });
});

test("@ui-regression @ui-refinement-hardening @ui-owner-secondary @ui-owner-links-layout @ui-responsive links surface stays straightforward on mobile", async ({ page }) => {
  await page.setViewportSize(mobileViewport);
  await signIn(page);
  await page.goto("/app/links");

  await expect(page.getByRole("heading", { name: "Reference shelf" })).toBeVisible();
  await expect(page.locator('[aria-label="Links overview"]')).toBeVisible();
  await expect(page.getByRole("textbox", { name: /^URL$/ })).toBeVisible();
  await expect(page.locator(".secondary-link-item")).toHaveCount(seededLinks.length);
  await expect(page.getByRole("button", { exact: true, name: "Unpublish link" })).toBeVisible();
  await expectLinksHierarchy(page, "mobile");
  await expectAccessibleStructure(page);
  await expectNoHorizontalOverflow(page);

  await expect(page.locator(".feature-layout")).toHaveScreenshot("ui-owner-secondary-links-mobile.png", {
    animations: "disabled"
  });
});

test("@ui-regression @ui-owner-secondary tags surface keeps retrieval anchors on desktop", async ({ page }) => {
  await page.setViewportSize(desktopViewport);
  await signIn(page);
  await page.goto("/app/tags?tag=studio-systems");

  await expect(page.getByRole("heading", { name: "Browse one private taxonomy" })).toBeVisible();
  await expect(page.locator('[aria-label="Tags overview"]')).toBeVisible();
  await expect(page.locator(".secondary-filter-panel .section-heading").getByText("Tag filters")).toBeVisible();
  await expect(page.locator(".secondary-note-panel .section-heading").getByText("Notes tagged studio-systems")).toBeVisible();
  await expect(page.locator(".secondary-link-panel .section-heading").getByText("Links tagged studio-systems")).toBeVisible();
  await expect(page.locator(".secondary-tag-filter")).toHaveCount(1 + 4);
  await expectTagsHierarchy(page, "desktop");
  await expectMatchedSurfaceWidths(page, [".secondary-route-hero", ".secondary-filter-panel"]);
  await expectAccessibleStructure(page);
  await expectNoHorizontalOverflow(page);

  await expect(page.locator(".feature-layout")).toHaveScreenshot("ui-owner-secondary-tags-desktop.png", {
    animations: "disabled"
  });
});

test("@ui-regression @ui-owner-secondary @ui-responsive tags surface stays scannable on mobile", async ({ page }) => {
  await page.setViewportSize(mobileViewport);
  await signIn(page);
  await page.goto("/app/tags?tag=studio-systems");

  await expect(page.getByRole("heading", { name: "Browse one private taxonomy" })).toBeVisible();
  await expect(page.locator('[aria-label="Tags overview"]')).toBeVisible();
  await expect(page.locator(".secondary-filter-panel .section-heading").getByText("Tag filters")).toBeVisible();
  await expect(page.locator(".secondary-note-item")).toHaveCount(1);
  await expect(page.locator(".secondary-link-item")).toHaveCount(1);
  await expectTagsHierarchy(page, "mobile");
  await expectAccessibleStructure(page);
  await expectNoHorizontalOverflow(page);

  await expect(page.locator(".feature-layout")).toHaveScreenshot("ui-owner-secondary-tags-mobile.png", {
    animations: "disabled"
  });
});

test("@ui-regression @ui-owner-secondary search surface keeps results structured on desktop", async ({ page }) => {
  await page.setViewportSize(desktopViewport);
  await signIn(page);
  await page.goto("/app/search?q=rhythm");

  await expect(page.getByRole("heading", { name: "Search the private vault" })).toBeVisible();
  await expect(page.locator('[aria-label="Search overview"]')).toBeVisible();
  await expect(page.getByRole("searchbox", { name: /^Query$/ })).toHaveValue("rhythm");
  await expect(page.locator(".secondary-note-panel .section-heading").getByText("Matching notes")).toBeVisible();
  await expect(page.locator(".secondary-link-panel .section-heading").getByText("Matching links")).toBeVisible();
  await expectSearchHierarchy(page, "desktop");
  await expectMatchedSurfaceWidths(page, [".secondary-route-hero", ".secondary-search-form"]);
  await expectAccessibleStructure(page);
  await expectNoHorizontalOverflow(page);

  await expect(page.locator(".feature-layout")).toHaveScreenshot("ui-owner-secondary-search-desktop.png", {
    animations: "disabled"
  });
});

test("@ui-regression @ui-owner-secondary @ui-responsive search surface stays stacked on mobile", async ({ page }) => {
  await page.setViewportSize(mobileViewport);
  await signIn(page);
  await page.goto("/app/search?q=rhythm");

  await expect(page.getByRole("heading", { name: "Search the private vault" })).toBeVisible();
  await expect(page.locator('[aria-label="Search overview"]')).toBeVisible();
  await expect(page.getByRole("button", { name: "Search" })).toBeVisible();
  await expect(page.locator(".secondary-note-item")).toHaveCount(2);
  await expect(page.locator(".secondary-link-item")).toHaveCount(1);
  await expectSearchHierarchy(page, "mobile");
  await expectAccessibleStructure(page);
  await expectNoHorizontalOverflow(page);

  await expect(page.locator(".feature-layout")).toHaveScreenshot("ui-owner-secondary-search-mobile.png", {
    animations: "disabled"
  });
});
