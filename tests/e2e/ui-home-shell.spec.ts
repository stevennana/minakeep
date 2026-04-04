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
  throw new Error("DATABASE_URL must be set before running UI home shell tests.");
}

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({
    url: databaseUrl
  })
});

const seededNotes = [
  {
    title: "Field notes from a quieter archive",
    slug: "field-notes-from-a-quieter-archive",
    markdown: "# Field notes from a quieter archive",
    excerpt: "A compact archive works best when published notes stay legible, selective, and easy to revisit.",
    summary: "A short read on why public publishing should feel curated instead of promotional.",
    publishedAt: new Date("2024-04-16T09:30:00.000Z"),
    tags: ["archive", "public notes"]
  },
  {
    title: "Designing a note showroom without a landing-page hero",
    slug: "designing-a-note-showroom-without-a-landing-page-hero",
    markdown: "# Designing a note showroom without a landing-page hero",
    excerpt: "The homepage should behave like a reading shelf first: title, preview, and calm metadata before product framing.",
    summary: null,
    publishedAt: new Date("2024-04-12T14:00:00.000Z"),
    tags: ["design system"]
  },
  {
    title: "Selective publishing keeps the private vault honest",
    slug: "selective-publishing-keeps-the-private-vault-honest",
    markdown: "# Selective publishing keeps the private vault honest",
    excerpt: "Drafts, links, and AI metadata belong to the owner workspace until a note is intentionally promoted.",
    summary: "Publishing becomes clearer when the public shell feels like an archive view rather than a product pitch.",
    publishedAt: new Date("2024-04-08T08:15:00.000Z"),
    tags: ["workflow", "private vault"]
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
    throw new Error(`Owner account '${username}' must exist before UI home shell tests run.`);
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

async function expectShowroomHierarchy(page: Page) {
  const shellHead = page.locator(".public-home-shell-head");
  const sectionHeading = page.locator(".note-collection-panel .section-heading");
  const firstCard = page.locator(".public-note-showroom .note-preview-card").first();
  const shellHeadBox = await shellHead.boundingBox();
  const sectionHeadingBox = await sectionHeading.boundingBox();
  const firstCardBox = await firstCard.boundingBox();

  expect(shellHeadBox).not.toBeNull();
  expect(sectionHeadingBox).not.toBeNull();
  expect(firstCardBox).not.toBeNull();

  if (!shellHeadBox || !sectionHeadingBox || !firstCardBox) {
    return;
  }

  expect(shellHeadBox.y).toBeLessThan(sectionHeadingBox.y);
  expect(sectionHeadingBox.y).toBeLessThan(firstCardBox.y);
  expect(shellHeadBox.width).toBeGreaterThan(0);
}

async function expectHomepageTypography(page: Page, viewport: "desktop" | "mobile") {
  const styles = await page.evaluate(() => {
    const heading = document.querySelector(".public-intro-panel h1");
    const eyebrow = document.querySelector(".public-intro-panel .eyebrow");
    const archiveCount = document.querySelector(".public-home-count strong");
    const sectionLabel = document.querySelector(".note-collection-panel .section-heading strong");

    if (!heading || !eyebrow || !archiveCount || !sectionLabel) {
      return null;
    }

    return {
      archiveCountColor: getComputedStyle(archiveCount).color,
      archiveCountSize: Number.parseFloat(getComputedStyle(archiveCount).fontSize),
      eyebrowSize: Number.parseFloat(getComputedStyle(eyebrow).fontSize),
      headingSize: Number.parseFloat(getComputedStyle(heading).fontSize),
      sectionLabelColor: getComputedStyle(sectionLabel).color
    };
  });

  expect(styles).not.toBeNull();

  if (!styles) {
    return;
  }

  expect(styles.headingSize).toBeGreaterThan(styles.eyebrowSize + (viewport === "desktop" ? 7 : 6));
  expect(styles.headingSize).toBeLessThan(viewport === "desktop" ? 30 : 28);
  expect(styles.archiveCountSize).toBeLessThan(styles.headingSize);
  expect(styles.archiveCountColor).toBe("rgb(51, 65, 85)");
  expect(styles.sectionLabelColor).toBe("rgb(51, 65, 85)");
}

test.describe.configure({ mode: "serial" });

test.beforeEach(async () => {
  await seedPublishedNotes();
});

test.afterAll(async () => {
  await prisma.$disconnect();
});

test("@ui-regression @ui-home-shell @ui-public-home-shell @ui-public-type @ui-responsive @ui-public-taste-regression homepage reads note-first on desktop", async ({ page }) => {
  await page.setViewportSize(desktopViewport);
  await page.goto("/");

  await expect(page.locator(".public-note-showroom .note-preview-card")).toHaveCount(seededNotes.length);
  await expect(page.locator(".public-home-shell-head")).toBeVisible();
  await expect(page.locator(".note-collection-panel .section-heading").filter({ hasText: "Published notes" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Published notes" })).toBeVisible();
  await expect(page.locator(".public-intro-panel .lede")).toHaveCount(0);
  await expect(page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: "Owner login" })).toBeVisible();
  await expect(page.getByRole("complementary")).toHaveCount(0);
  await expect(page.getByText("Owner entrance")).toHaveCount(0);
  await expect(page.getByText("Private origin")).toHaveCount(0);
  await expectShowroomHierarchy(page);
  await expectHomepageTypography(page, "desktop");
  await expectAccessibleStructure(page);
  await expectNoHorizontalOverflow(page);

  await expect(page.locator(".public-home-grid")).toHaveScreenshot("ui-home-shell-desktop.png", {
    animations: "disabled",
    maxDiffPixelRatio: 0.02
  });
});

test("@ui-regression @ui-home-shell @ui-public-home-shell @ui-public-type @ui-responsive @ui-public-taste-regression homepage stays note-first on mobile", async ({ page }) => {
  await page.setViewportSize(mobileViewport);
  await page.goto("/");

  await expect(page.locator(".public-note-showroom .note-preview-card")).toHaveCount(seededNotes.length);
  await expect(page.locator(".public-home-shell-head")).toBeVisible();
  await expect(page.locator(".note-collection-panel .section-heading").filter({ hasText: "Published notes" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Published notes" })).toBeVisible();
  await expect(page.locator(".public-intro-panel .lede")).toHaveCount(0);
  await expect(page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: "Owner login" })).toBeVisible();
  await expect(page.getByRole("complementary")).toHaveCount(0);
  await expect(page.getByText("Owner entrance")).toHaveCount(0);
  await expect(page.getByText("Private origin")).toHaveCount(0);
  await expectShowroomHierarchy(page);
  await expectHomepageTypography(page, "mobile");
  await expectAccessibleStructure(page);
  await expectNoHorizontalOverflow(page);

  await expect(page.locator(".public-home-grid")).toHaveScreenshot("ui-home-shell-mobile.png", {
    animations: "disabled",
    maxDiffPixelRatio: 0.02
  });
});
