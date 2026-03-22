import "dotenv/config";

import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";
import { expect, test, type Page } from "@playwright/test";

const desktopViewport = { width: 1440, height: 900 };
const mobileViewport = { width: 390, height: 844 };

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL must be set before running owner dashboard UI tests.");
}

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({
    url: databaseUrl
  })
});

const seededNotes = [
  {
    title: "Selective notes should stay scannable at workbench density",
    slug: "selective-notes-should-stay-scannable-at-workbench-density",
    markdown: "# Selective notes should stay scannable at workbench density",
    excerpt:
      "A tighter owner dashboard should show more authored context before metadata, while still keeping status and generated tags within reach.",
    summary:
      "A short argument for reducing dashboard bulk so note editing feels like a working tool instead of a collection of oversized cards.",
    enrichmentStatus: "ready",
    enrichmentError: null,
    enrichmentAttempts: 1,
    enrichmentUpdatedAt: new Date("2024-05-15T09:00:00.000Z"),
    isPublished: true,
    publishedAt: new Date("2024-05-15T09:05:00.000Z"),
    updatedAt: new Date("2024-05-15T09:05:00.000Z"),
    tags: ["dashboard", "density", "notes"]
  },
  {
    title: "Draft notes need enough excerpt room to avoid blind reopening",
    slug: "draft-notes-need-enough-excerpt-room-to-avoid-blind-reopening",
    markdown: "# Draft notes need enough excerpt room to avoid blind reopening",
    excerpt:
      "The owner should be able to distinguish two similar drafts from the list alone, without opening both tabs just to remember what changed.",
    summary:
      "Compact layouts still need enough excerpt depth to make each draft recognizable at a glance.",
    enrichmentStatus: "ready",
    enrichmentError: null,
    enrichmentAttempts: 2,
    enrichmentUpdatedAt: new Date("2024-05-13T15:20:00.000Z"),
    isPublished: false,
    publishedAt: null,
    updatedAt: new Date("2024-05-13T15:20:00.000Z"),
    tags: ["drafts", "workflow"]
  },
  {
    title: "Pending enrichment should stay visible without taking over the row",
    slug: "pending-enrichment-should-stay-visible-without-taking-over-the-row",
    markdown: "# Pending enrichment should stay visible without taking over the row",
    excerpt:
      "AI status belongs in the dashboard because it affects confidence, but it should sit in a quieter support rail than the authored note title and excerpt.",
    summary: null,
    enrichmentStatus: "pending",
    enrichmentError: null,
    enrichmentAttempts: 0,
    enrichmentUpdatedAt: new Date("2024-05-11T07:45:00.000Z"),
    isPublished: false,
    publishedAt: null,
    updatedAt: new Date("2024-05-11T07:45:00.000Z"),
    tags: []
  },
  {
    title: "Failed enrichment needs a visible message, not a dramatic warning slab",
    slug: "failed-enrichment-needs-a-visible-message-not-a-dramatic-warning-slab",
    markdown: "# Failed enrichment needs a visible message, not a dramatic warning slab",
    excerpt:
      "When enrichment fails, the dashboard should still read as a notes workspace first. The failure detail matters, but it should not dominate the row.",
    summary:
      "A compact dashboard can keep AI failure readable by using lighter supporting copy and preserving the note title as the strongest visual anchor.",
    enrichmentStatus: "failed",
    enrichmentError: "The Mina AI endpoint timed out.",
    enrichmentAttempts: 1,
    enrichmentUpdatedAt: new Date("2024-05-08T18:10:00.000Z"),
    isPublished: true,
    publishedAt: new Date("2024-05-08T18:15:00.000Z"),
    updatedAt: new Date("2024-05-08T18:10:00.000Z"),
    tags: ["ai", "failure"]
  }
] as const;

function getOwnerCredentials() {
  return {
    username: process.env.OWNER_USERNAME ?? "owner",
    password: process.env.OWNER_PASSWORD ?? "password"
  };
}

async function seedOwnerDashboardNotes() {
  const { username } = getOwnerCredentials();
  const owner = await prisma.user.findUnique({
    where: {
      username
    }
  });

  if (!owner) {
    throw new Error(`Owner account '${username}' must exist before owner dashboard UI tests run.`);
  }

  await prisma.note.deleteMany({
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

async function expectDesktopDashboardHierarchy(page: Page) {
  const grid = page.locator(".owner-dashboard-grid");
  const mainPanel = page.locator(".owner-dashboard-main");
  const hero = page.locator(".dashboard-hero");
  const firstNote = page.locator(".dashboard-note-item").first();
  const sidePanel = page.locator(".owner-dashboard-side-panel");
  const routeGrid = page.locator(".dashboard-route-grid");

  await expect(page.getByRole("navigation", { name: "Dashboard route shortcuts" })).toHaveCount(0);
  await expect(sidePanel).toHaveCount(0);
  await expect(routeGrid).toHaveCount(0);

  const [gridBox, mainBox, heroBox, noteBox] = await Promise.all([
    grid.boundingBox(),
    mainPanel.boundingBox(),
    hero.boundingBox(),
    firstNote.boundingBox()
  ]);

  expect(gridBox).not.toBeNull();
  expect(mainBox).not.toBeNull();
  expect(heroBox).not.toBeNull();
  expect(noteBox).not.toBeNull();

  if (!gridBox || !mainBox || !heroBox || !noteBox) {
    return;
  }

  expect(mainBox.width / gridBox.width).toBeGreaterThan(0.96);
  expect(noteBox.width / mainBox.width).toBeGreaterThan(0.92);
  expect(heroBox.height).toBeLessThan(320);
  expect(noteBox.height).toBeLessThan(300);
}

async function expectMobileDashboardHierarchy(page: Page) {
  const mainPanel = page.locator(".owner-dashboard-main");
  const hero = page.locator(".dashboard-hero");
  const sidePanel = page.locator(".owner-dashboard-side-panel");
  const routeGrid = page.locator(".dashboard-route-grid");

  await expect(page.getByRole("navigation", { name: "Dashboard route shortcuts" })).toHaveCount(0);
  await expect(sidePanel).toHaveCount(0);
  await expect(routeGrid).toHaveCount(0);

  const [mainBox, heroBox] = await Promise.all([mainPanel.boundingBox(), hero.boundingBox()]);

  expect(mainBox).not.toBeNull();
  expect(heroBox).not.toBeNull();

  if (!mainBox || !heroBox) {
    return;
  }

  expect(heroBox.height).toBeLessThan(380);
}

async function expectTypographyHierarchy(page: Page) {
  const styles = await page.evaluate(() => {
    const title = document.querySelector(".dashboard-hero-title");
    const noteLink = document.querySelector(".dashboard-note-link");
    const aiSummary = document.querySelector(".dashboard-note-ai-summary");

    if (!title || !noteLink || !aiSummary) {
      return null;
    }

    return {
      aiSummaryColor: getComputedStyle(aiSummary).color,
      aiSummarySize: Number.parseFloat(getComputedStyle(aiSummary).fontSize),
      noteLinkSize: Number.parseFloat(getComputedStyle(noteLink).fontSize),
      titleSize: Number.parseFloat(getComputedStyle(title).fontSize)
    };
  });

  expect(styles).not.toBeNull();

  if (!styles) {
    return;
  }

  expect(styles.titleSize).toBeLessThan(38);
  expect(styles.noteLinkSize).toBeGreaterThan(styles.aiSummarySize);
  expect(styles.aiSummaryColor).not.toBe("rgb(17, 24, 39)");
}

test.describe.configure({ mode: "serial" });

test.beforeEach(async () => {
  await seedOwnerDashboardNotes();
});

test.afterAll(async () => {
  await prisma.$disconnect();
});

test("@ui-regression @ui-refinement-hardening @ui-owner-dashboard @ui-responsive owner dashboard stays compact on desktop", async ({ page }) => {
  await page.setViewportSize(desktopViewport);
  await signIn(page);

  await expect(page.getByRole("heading", { name: /owner.?.s notes/i })).toBeVisible();
  await expect(page.getByLabel("Dashboard overview")).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Dashboard route shortcuts" })).toHaveCount(0);
  await expect(page.locator(".dashboard-note-item .dashboard-note-ai > strong")).toHaveCount(seededNotes.length);
  await expect(page.locator(".dashboard-note-item")).toHaveCount(seededNotes.length);
  await expectDesktopDashboardHierarchy(page);
  await expectTypographyHierarchy(page);
  await expectMatchedSurfaceWidths(page, [".dashboard-hero", ".owner-dashboard-main"]);
  await expectAccessibleStructure(page);
  await expectNoHorizontalOverflow(page);

  await expect(page.locator(".feature-layout")).toHaveScreenshot("ui-owner-dashboard-desktop.png", {
    animations: "disabled"
  });
});

test("@ui-regression @ui-refinement-hardening @ui-owner-dashboard @ui-responsive owner dashboard stays usable on mobile", async ({ page }) => {
  await page.setViewportSize(mobileViewport);
  await signIn(page);

  await expect(page.getByRole("heading", { name: /owner.?.s notes/i })).toBeVisible();
  await expect(page.getByLabel("Dashboard overview")).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Dashboard route shortcuts" })).toHaveCount(0);
  await expect(page.locator(".dashboard-note-item")).toHaveCount(seededNotes.length);
  await expectMobileDashboardHierarchy(page);
  await expectTypographyHierarchy(page);
  await expectAccessibleStructure(page);
  await expectNoHorizontalOverflow(page);

  await expect(page.locator(".feature-layout")).toHaveScreenshot("ui-owner-dashboard-mobile.png", {
    animations: "disabled"
  });
});

test("@ui-regression @ui-refinement-hardening @ui-owner-notes-priority owner dashboard gives notes the prime desktop lane", async ({ page }) => {
  await page.setViewportSize(desktopViewport);
  await signIn(page);

  const mainPanel = page.locator(".owner-dashboard-main");

  await expect(page.getByRole("navigation", { name: "Dashboard route shortcuts" })).toHaveCount(0);
  await expect(mainPanel.getByRole("link", { name: "Links" })).toHaveCount(0);
  await expect(mainPanel.getByRole("link", { name: "Tags" })).toHaveCount(0);
  await expect(mainPanel.getByRole("link", { name: "Search" })).toHaveCount(0);
  await expect(page.locator(".owner-dashboard-side-panel")).toHaveCount(0);
  await expect(page.locator(".dashboard-route-grid")).toHaveCount(0);
  await expectDesktopDashboardHierarchy(page);
  await expectNoHorizontalOverflow(page);
});
