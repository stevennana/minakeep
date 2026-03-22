import "dotenv/config";

import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";
import { expect, test, type Page } from "@playwright/test";

const desktopViewport = { width: 1440, height: 900 };
const mobileViewport = { width: 390, height: 844 };

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL must be set before running public tag fit UI tests.");
}

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({
    url: databaseUrl
  })
});

const seededNote = {
  title: "Tag chips should fit a calmer public hierarchy",
  slug: "tag-chips-should-fit-a-calmer-public-hierarchy",
  markdown: `## Calm hierarchy depends on fit

The public note should feel finished without oversized headings or hard black emphasis.

**Strong text** should still guide the eye when a reader scans the page.
`,
  excerpt: "Public chips and metadata should fit without clipping or visual shouting.",
  summary: "Calmer public typography works when titles lead, metadata recedes, and long AI tags stay inside their chip.",
  publishedAt: new Date("2024-08-02T09:30:00.000Z"),
  tags: [
    "calmer hierarchy",
    "public metadata fit",
    "public-facing-tag-chip-with-a-label-that-needs-to-wrap-cleanly"
  ]
} as const;

const seededLink = {
  title: "Reference shelf for wrapped public tags",
  url: "https://example.com/reference-shelf-for-wrapped-public-tags",
  summary: "A published link proves that the shared public card chip rules also fit long link tags on mobile.",
  publishedAt: new Date("2024-08-01T09:30:00.000Z"),
  tags: [
    "external reference",
    "chip fit regression coverage",
    "link-tag-that-needs-to-wrap-without-escaping-its-chip"
  ]
} as const;

async function seedPublicContent() {
  const username = process.env.OWNER_USERNAME ?? "owner";
  const owner = await prisma.user.findUnique({
    where: {
      username
    }
  });

  if (!owner) {
    throw new Error(`Owner account '${username}' must exist before public tag fit UI tests run.`);
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

  await prisma.note.create({
    data: {
      ownerId: owner.id,
      title: seededNote.title,
      slug: seededNote.slug,
      markdown: seededNote.markdown,
      excerpt: seededNote.excerpt,
      summary: seededNote.summary,
      enrichmentStatus: "ready",
      isPublished: true,
      publishedAt: seededNote.publishedAt,
      createdAt: seededNote.publishedAt,
      updatedAt: seededNote.publishedAt,
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

  await prisma.link.create({
    data: {
      ownerId: owner.id,
      title: seededLink.title,
      url: seededLink.url,
      summary: seededLink.summary,
      enrichmentStatus: "ready",
      isPublished: true,
      publishedAt: seededLink.publishedAt,
      createdAt: seededLink.publishedAt,
      updatedAt: seededLink.publishedAt,
      tags: {
        connectOrCreate: seededLink.tags.map((tag) => ({
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

async function expectTagChipsToFit(page: Page, selector: string, minimumWrappedCount: number) {
  const metrics = await page.evaluate((chipSelector) => {
    const tags = Array.from(document.querySelectorAll<HTMLElement>(chipSelector));

    return tags.map((tag) => {
      const styles = getComputedStyle(tag);
      const fontSize = Number.parseFloat(styles.fontSize);
      const lineHeight = Number.parseFloat(styles.lineHeight) || fontSize * 1.35;

      return {
        clientHeight: tag.clientHeight,
        clientWidth: tag.clientWidth,
        lineHeight,
        scrollHeight: tag.scrollHeight,
        scrollWidth: tag.scrollWidth
      };
    });
  }, selector);

  expect(metrics.length).toBeGreaterThan(0);
  expect(metrics.filter((metric) => metric.scrollWidth > metric.clientWidth + 1 || metric.scrollHeight > metric.clientHeight + 1)).toHaveLength(0);
  expect(metrics.filter((metric) => metric.clientHeight > metric.lineHeight * 1.6).length).toBeGreaterThanOrEqual(minimumWrappedCount);
}

async function expectShowroomTypography(page: Page) {
  const styles = await page.evaluate(() => {
    const homeHeading = document.querySelector(".public-intro-panel h1");
    const cardTitle = document.querySelector("[data-testid='public-home-showroom'] .note-preview-card .note-list-link");
    const cardSummary = document.querySelector("[data-testid='public-home-showroom'] .note-preview-card .note-preview-card-summary");
    const cardMeta = document.querySelector("[data-testid='public-home-showroom'] .public-card-meta");
    const sectionHeading = document.querySelector(".public-showroom-section-heading strong");

    if (!homeHeading || !cardTitle || !cardSummary || !cardMeta || !sectionHeading) {
      return null;
    }

    return {
      cardMetaSize: Number.parseFloat(getComputedStyle(cardMeta).fontSize),
      cardSummarySize: Number.parseFloat(getComputedStyle(cardSummary).fontSize),
      cardTitleSize: Number.parseFloat(getComputedStyle(cardTitle).fontSize),
      homeHeadingSize: Number.parseFloat(getComputedStyle(homeHeading).fontSize),
      sectionHeadingColor: getComputedStyle(sectionHeading).color
    };
  });

  expect(styles).not.toBeNull();

  if (!styles) {
    return;
  }

  expect(styles.homeHeadingSize).toBeLessThan(23);
  expect(styles.cardTitleSize).toBeGreaterThan(styles.cardSummarySize + 1);
  expect(styles.cardTitleSize).toBeLessThan(20);
  expect(styles.cardMetaSize).toBeLessThan(styles.cardSummarySize);
  expect(styles.sectionHeadingColor).toBe("rgb(51, 65, 85)");
}

async function expectPublicNoteTypography(page: Page) {
  const styles = await page.evaluate(() => {
    const heading = document.querySelector(".public-note-header h1");
    const body = document.querySelector("[data-testid='public-note-markdown'] p");
    const h2 = document.querySelector("[data-testid='public-note-markdown'] h2");
    const strong = document.querySelector("[data-testid='public-note-markdown'] strong");
    const meta = document.querySelector(".public-note-meta");
    const supportStrong = document.querySelector("[data-testid='public-note-support'] strong");

    if (!heading || !body || !h2 || !strong || !meta || !supportStrong) {
      return null;
    }

    return {
      bodySize: Number.parseFloat(getComputedStyle(body).fontSize),
      h2Size: Number.parseFloat(getComputedStyle(h2).fontSize),
      headingSize: Number.parseFloat(getComputedStyle(heading).fontSize),
      metaSize: Number.parseFloat(getComputedStyle(meta).fontSize),
      strongColor: getComputedStyle(strong).color,
      supportStrongColor: getComputedStyle(supportStrong).color,
      supportStrongSize: Number.parseFloat(getComputedStyle(supportStrong).fontSize)
    };
  });

  expect(styles).not.toBeNull();

  if (!styles) {
    return;
  }

  expect(styles.headingSize).toBeGreaterThan(styles.h2Size + 6);
  expect(styles.headingSize).toBeLessThan(35);
  expect(styles.h2Size).toBeGreaterThan(styles.bodySize + 2);
  expect(styles.h2Size).toBeLessThan(24);
  expect(styles.metaSize).toBeLessThan(styles.bodySize);
  expect(styles.supportStrongSize).toBeLessThan(styles.bodySize);
  expect(styles.strongColor).toBe("rgb(51, 65, 85)");
  expect(styles.supportStrongColor).toBe("rgb(100, 116, 139)");
}

test.describe.configure({ mode: "serial" });

test.beforeEach(async () => {
  await seedPublicContent();
});

test.afterAll(async () => {
  await prisma.$disconnect();
});

test("@ui-public-tag-fit @ui-responsive public showroom keeps long tag chips fitted on mobile", async ({ page }) => {
  await page.setViewportSize(mobileViewport);
  await page.goto("/");

  await expect(page.getByRole("link", { name: seededNote.title })).toBeVisible();
  await expect(page.getByRole("link", { name: seededLink.title })).toBeVisible();
  await expect(page.getByLabel("Published note tags")).toContainText("public-facing-tag-chip-with-a-label-that-needs-to-wrap-cleanly");
  await expect(page.getByLabel("Published link tags")).toContainText("link-tag-that-needs-to-wrap-without-escaping-its-chip");
  await expectTagChipsToFit(page, "[data-testid='public-home-showroom'] .tag-pill", 2);
  await expectShowroomTypography(page);
  await expectNoHorizontalOverflow(page);
});

test("@ui-public-tag-fit @ui-responsive public note keeps long tag chips fitted with a calm desktop hierarchy", async ({ page }) => {
  await page.setViewportSize(desktopViewport);
  await page.goto(`/notes/${seededNote.slug}`);

  await expect(page.getByRole("heading", { name: seededNote.title })).toBeVisible();
  await expect(page.getByText("Calm hierarchy depends on fit")).toBeVisible();
  await expect(page.getByText(seededNote.summary)).toBeVisible();
  await expect(page.getByLabel("Published note tags")).toContainText("public-facing-tag-chip-with-a-label-that-needs-to-wrap-cleanly");
  await expectTagChipsToFit(page, ".public-note-tags .tag-pill", 1);
  await expectPublicNoteTypography(page);
  await expectNoHorizontalOverflow(page);
});
