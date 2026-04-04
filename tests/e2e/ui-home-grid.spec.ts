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
  throw new Error("DATABASE_URL must be set before running UI home grid tests.");
}

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({
    url: databaseUrl
  })
});

const seededNotes = [
  {
    title: "Field notes from a public archive that still feels private at the edges",
    slug: "field-notes-from-a-public-archive-that-still-feels-private-at-the-edges",
    markdown: "# Field notes from a public archive that still feels private at the edges",
    excerpt:
      "A showroom works when each published note carries enough signal to feel deliberate, not merely exported from the private vault.",
    summary: "A longer note preview earns space when it helps the homepage read like an edited shelf instead of a product brochure.",
    publishedAt: new Date("2024-05-18T09:30:00.000Z"),
    tags: ["archive", "showroom"]
  },
  {
    title: "Selective notes scan faster",
    slug: "selective-notes-scan-faster",
    markdown: "# Selective notes scan faster",
    excerpt: "Short previews keep the archive readable.",
    summary: null,
    publishedAt: new Date("2024-05-16T09:30:00.000Z"),
    tags: ["editing"]
  },
  {
    title: "How to keep a public note grid calm",
    slug: "how-to-keep-a-public-note-grid-calm",
    markdown: "# How to keep a public note grid calm",
    excerpt:
      "The trick is not uniformity. It is letting titles and previews breathe while dates and generated metadata stay supportive.",
    summary: null,
    publishedAt: new Date("2024-05-12T14:00:00.000Z"),
    tags: ["hierarchy", "reading"]
  },
  {
    title: "Published notes should feel chosen, not dumped",
    slug: "published-notes-should-feel-chosen-not-dumped",
    markdown: "# Published notes should feel chosen, not dumped",
    excerpt:
      "Curation shows up in rhythm: one richer card beside a quieter one, then another that opens enough room for tags and a second supporting line.",
    summary:
      "A dynamic archive can still read quickly when the homepage treats summaries as editorial emphasis instead of a mandatory block on every card.",
    publishedAt: new Date("2024-05-08T10:45:00.000Z"),
    tags: ["curation", "layout", "published notes"]
  },
  {
    title: "Quiet metadata, loud titles",
    slug: "quiet-metadata-loud-titles",
    markdown: "# Quiet metadata, loud titles",
    excerpt: "Dates belong lower in the card than the title and preview.",
    summary: null,
    publishedAt: new Date("2024-05-04T08:15:00.000Z"),
    tags: []
  },
  {
    title: "A showroom needs a rhythm, not a hero banner",
    slug: "a-showroom-needs-a-rhythm-not-a-hero-banner",
    markdown: "# A showroom needs a rhythm, not a hero banner",
    excerpt:
      "Introductory framing still matters, but it should stay secondary once the published note grid is visible.",
    summary: "The homepage becomes easier to trust when the archive takes over the first screen.",
    publishedAt: new Date("2024-05-01T12:00:00.000Z"),
    tags: ["homepage"]
  }
] as const;

async function seedPublishedNotes() {
  const username = process.env.OWNER_USERNAME ?? "owner";
  const owner = await prisma.user.findUnique({
    where: {
      username
    }
  });

  if (!owner) {
    throw new Error(`Owner account '${username}' must exist before UI home grid tests run.`);
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

  for (const note of seededNotes) {
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

async function expectShowroomRhythm(page: Page, viewport: "desktop" | "mobile") {
  const cards = page.locator(".public-note-showroom .note-preview-card");
  const boxes = await cards.evaluateAll((elements) =>
    elements.map((element) => {
      const rect = element.getBoundingClientRect();

      return {
        height: Math.round(rect.height),
        width: Math.round(rect.width),
        x: Math.round(rect.x),
        y: Math.round(rect.y)
      };
    })
  );
  const variants = await cards.evaluateAll((elements) => elements.map((element) => element.getAttribute("data-card-variant")));
  const uniqueHeights = [...new Set(boxes.map((box) => box.height))];

  expect(new Set(variants).size).toBeGreaterThanOrEqual(3);
  expect(uniqueHeights.length).toBeGreaterThanOrEqual(viewport === "desktop" ? 3 : 2);
  expect(Math.max(...boxes.map((box) => box.height)) - Math.min(...boxes.map((box) => box.height))).toBeGreaterThan(
    viewport === "desktop" ? 72 : 48
  );

  if (viewport === "desktop") {
    expect(new Set(boxes.slice(0, 6).map((box) => box.x)).size).toBeGreaterThanOrEqual(3);
  } else {
    expect(Math.max(...boxes.map((box) => box.x)) - Math.min(...boxes.map((box) => box.x))).toBeLessThanOrEqual(2);
    expect(boxes[1]?.y).toBeGreaterThan(boxes[0]?.y ?? 0);
  }
}

async function expectShowroomColumns(page: Page, viewport: "desktop" | "mobile") {
  const layout = await page.evaluate(() => {
    const showroom = document.querySelector<HTMLElement>(".public-note-showroom");

    if (!showroom) {
      return null;
    }

    const styles = getComputedStyle(showroom);

    return {
      columnCount: Number.parseInt(styles.columnCount, 10),
      display: styles.display
    };
  });

  expect(layout).not.toBeNull();

  if (!layout) {
    return;
  }

  expect(layout.display).toBe("block");

  if (viewport === "desktop") {
    expect(layout.columnCount).toBeGreaterThanOrEqual(3);
  } else {
    expect(layout.columnCount).toBe(1);
  }
}

test.describe.configure({ mode: "serial" });

test.beforeEach(async () => {
  await seedPublishedNotes();
});

test.afterAll(async () => {
  await prisma.$disconnect();
});

test("@ui-regression @ui-home-grid @ui-public-showroom-masonry homepage showroom uses a varied desktop grid", async ({ page }) => {
  await page.setViewportSize(desktopViewport);
  await page.goto("/");

  await expect(page.locator(".public-note-showroom .note-preview-card")).toHaveCount(seededNotes.length);
  await expect(page.locator("[data-card-variant='compact']")).toHaveCount(2);
  await expect(page.locator("[data-card-variant='balanced']")).toHaveCount(2);
  await expect(page.locator("[data-card-variant='feature']")).toHaveCount(2);
  await expect(page.getByRole("link", { name: seededNotes[0].title })).toBeVisible();
  await expect(page.locator(".note-preview-card-summary").first()).toBeVisible();
  await expectShowroomColumns(page, "desktop");
  await expectShowroomRhythm(page, "desktop");
  await expectAccessibleStructure(page);
  await expectNoHorizontalOverflow(page);

  await expect(page.locator(".public-home-grid")).toHaveScreenshot("ui-home-grid-desktop.png", {
    animations: "disabled",
    maxDiffPixelRatio: 0.02
  });
});

test("@ui-regression @ui-home-grid @ui-public-showroom-masonry homepage showroom collapses cleanly on mobile", async ({ page }) => {
  await page.setViewportSize(mobileViewport);
  await page.goto("/");

  await expect(page.locator(".public-note-showroom .note-preview-card")).toHaveCount(seededNotes.length);
  await expect(page.locator("[data-card-variant='compact']")).toHaveCount(2);
  await expect(page.locator("[data-card-variant='balanced']")).toHaveCount(2);
  await expect(page.locator("[data-card-variant='feature']")).toHaveCount(2);
  await expect(page.getByRole("link", { name: seededNotes[0].title })).toBeVisible();
  await expectShowroomColumns(page, "mobile");
  await expectShowroomRhythm(page, "mobile");
  await expectAccessibleStructure(page);
  await expectNoHorizontalOverflow(page);

  await expect(page.locator(".public-home-grid")).toHaveScreenshot("ui-home-grid-mobile.png", {
    animations: "disabled",
    maxDiffPixelRatio: 0.02
  });
});
