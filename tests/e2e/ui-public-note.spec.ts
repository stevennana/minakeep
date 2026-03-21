import "dotenv/config";

import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";
import { expect, test, type Page } from "@playwright/test";

const desktopViewport = { width: 1440, height: 900 };
const mobileViewport = { width: 390, height: 844 };

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL must be set before running UI public note tests.");
}

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({
    url: databaseUrl
  })
});

const seededNote = {
  title: "Public notes should read like finished pages, not dashboards",
  slug: "public-notes-should-read-like-finished-pages-not-dashboards",
  markdown: `## Reading width is a product decision

The public note page should settle the eye quickly. The reader should feel the note before they feel the container around it.

Supporting metadata can stay available without taking the first beat of attention away from the authored text.

### Quiet signals still matter

- Dates should scan quickly.
- Generated tags should sit lower in the hierarchy.
- The note body should keep a steady reading measure.`,
  summary:
    "A public note feels calmer when the authored markdown carries the page and generated metadata stays visible in a subdued supporting position.",
  publishedAt: new Date("2024-05-21T09:30:00.000Z"),
  tags: ["reading", "hierarchy", "public notes"]
} as const;

async function seedPublishedNote() {
  const username = process.env.OWNER_USERNAME ?? "owner";
  const owner = await prisma.user.findUnique({
    where: {
      username
    }
  });

  if (!owner) {
    throw new Error(`Owner account '${username}' must exist before UI public note tests run.`);
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
      excerpt: "A public note page should stay compact, quiet, and reading-first.",
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

async function expectReadingHierarchy(page: Page, viewport: "desktop" | "mobile") {
  const metrics = await page.evaluate(() => {
    const heading = document.querySelector(".public-note-header h1");
    const body = document.querySelector("[data-testid='public-note-markdown']");
    const bodyMeasure = body?.querySelector("p, ul, ol, blockquote, h2, h3");
    const support = document.querySelector("[data-testid='public-note-support']");
    const meta = document.querySelector(".public-note-meta");

    if (!heading || !body || !bodyMeasure || !support || !meta) {
      throw new Error("Public note hierarchy anchors are missing.");
    }

    const headingRect = heading.getBoundingClientRect();
    const bodyRect = body.getBoundingClientRect();
    const bodyMeasureRect = bodyMeasure.getBoundingClientRect();
    const supportRect = support.getBoundingClientRect();
    const metaRect = meta.getBoundingClientRect();

    return {
      bodyMeasureWidth: Math.round(bodyMeasureRect.width),
      bodyTop: Math.round(bodyRect.top),
      headingTop: Math.round(headingRect.top),
      metaTop: Math.round(metaRect.top),
      supportTop: Math.round(supportRect.top),
      viewportWidth: document.documentElement.clientWidth
    };
  });

  expect(metrics.metaTop).toBeLessThan(metrics.headingTop);
  expect(metrics.headingTop).toBeLessThan(metrics.bodyTop);
  expect(metrics.bodyTop).toBeLessThan(metrics.supportTop);
  expect(metrics.bodyMeasureWidth).toBeLessThanOrEqual(viewport === "desktop" ? 760 : metrics.viewportWidth - 32);
}

async function expectSoftenedPublicType(page: Page, viewport: "desktop" | "mobile") {
  const styles = await page.evaluate(() => {
    const heading = document.querySelector(".public-note-header h1");
    const bodyParagraph = document.querySelector("[data-testid='public-note-markdown'] p");
    const supportStrong = document.querySelector("[data-testid='public-note-support'] strong");

    if (!heading || !bodyParagraph || !supportStrong) {
      return null;
    }

    return {
      bodySize: Number.parseFloat(getComputedStyle(bodyParagraph).fontSize),
      headingSize: Number.parseFloat(getComputedStyle(heading).fontSize),
      supportStrongColor: getComputedStyle(supportStrong).color,
      supportStrongSize: Number.parseFloat(getComputedStyle(supportStrong).fontSize)
    };
  });

  expect(styles).not.toBeNull();

  if (!styles) {
    return;
  }

  expect(styles.headingSize).toBeGreaterThan(styles.bodySize + (viewport === "desktop" ? 12 : 9));
  expect(styles.headingSize).toBeLessThan(viewport === "desktop" ? 35 : 32);
  expect(styles.supportStrongSize).toBeLessThan(styles.bodySize);
  expect(styles.supportStrongColor).toBe("rgb(51, 65, 85)");
}

test.describe.configure({ mode: "serial" });

test.beforeEach(async () => {
  await seedPublishedNote();
});

test.afterAll(async () => {
  await prisma.$disconnect();
});

test("@ui-regression @ui-public-note @ui-public-type @ui-responsive public note page keeps a calm desktop reading hierarchy", async ({ page }) => {
  await page.setViewportSize(desktopViewport);
  await page.goto(`/notes/${seededNote.slug}`);

  await expect(page.getByRole("heading", { name: seededNote.title })).toBeVisible();
  await expect(page.getByText("Reading width is a product decision")).toBeVisible();
  await expect(page.getByText(seededNote.summary)).toBeVisible();
  await expect(page.getByLabel("Published note tags")).toContainText("reading");
  await expect(page.getByRole("link", { name: "Back to published notes" })).toBeVisible();
  await expectReadingHierarchy(page, "desktop");
  await expectSoftenedPublicType(page, "desktop");
  await expectAccessibleStructure(page);
  await expectNoHorizontalOverflow(page);

  await expect(page.locator(".public-note-card")).toHaveScreenshot("ui-public-note-desktop.png", {
    animations: "disabled"
  });
});

test("@ui-regression @ui-public-note @ui-public-type @ui-responsive public note page stays compact on mobile", async ({ page }) => {
  await page.setViewportSize(mobileViewport);
  await page.goto(`/notes/${seededNote.slug}`);

  await expect(page.getByRole("heading", { name: seededNote.title })).toBeVisible();
  await expect(page.getByText("Quiet signals still matter")).toBeVisible();
  await expect(page.getByText(seededNote.summary)).toBeVisible();
  await expect(page.getByRole("link", { name: "Back to published notes" })).toBeVisible();
  await expectReadingHierarchy(page, "mobile");
  await expectSoftenedPublicType(page, "mobile");
  await expectAccessibleStructure(page);
  await expectNoHorizontalOverflow(page);

  await expect(page.locator(".public-note-card")).toHaveScreenshot("ui-public-note-mobile.png", {
    animations: "disabled"
  });
});
