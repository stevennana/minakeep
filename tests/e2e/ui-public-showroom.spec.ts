import "dotenv/config";

import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";
import { expect, test, type Locator, type Page } from "@playwright/test";

const desktopViewport = { width: 1440, height: 900 };
const mobileViewport = { width: 390, height: 844 };

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL must be set before running public showroom UI tests.");
}

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({
    url: databaseUrl
  })
});

const seededPublishedNotes = [
  {
    title: "Archive rhythm note",
    slug: "archive-rhythm-note",
    markdown: "# Archive rhythm note",
    excerpt: "A published note that should stay visible in the mixed showroom before filtering.",
    summary: "Longer note previews should still read cleanly beside published links on the public homepage.",
    publishedAt: new Date("2024-07-12T09:30:00.000Z"),
    tags: ["archive", "showroom"]
  },
  {
    title: "Needle note title",
    slug: "needle-note-title",
    markdown: "# Needle note title",
    excerpt: "A shorter published note that should survive a title-only filter.",
    summary: null,
    publishedAt: new Date("2024-07-08T09:30:00.000Z"),
    tags: ["search"]
  }
] as const;

const seededPublishedLinks = [
  {
    title: "Library reference shelf",
    url: "https://example.com/library-reference-shelf",
    summary: "A published link that keeps the mixed feed visibly distinct from note cards.",
    publishedAt: new Date("2024-07-10T09:30:00.000Z"),
    tags: ["links", "reference"]
  },
  {
    title: "Needle link title",
    url: "https://example.com/needle-link-title",
    summary: "A published link that should remain visible when the title-only filter matches.",
    publishedAt: new Date("2024-07-06T09:30:00.000Z"),
    tags: ["search"]
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
    throw new Error(`Owner account '${username}' must exist before public showroom UI tests run.`);
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

async function expectMixedFeedRhythm(page: Page, viewport: "desktop" | "mobile") {
  const cards = page.locator("[data-testid='public-home-showroom'] .note-preview-card");
  const boxes = await cards.evaluateAll((elements) =>
    elements.map((element) => {
      const rect = element.getBoundingClientRect();

      return {
        x: Math.round(rect.x),
        y: Math.round(rect.y)
      };
    })
  );
  const kinds = await cards.evaluateAll((elements) => elements.map((element) => element.getAttribute("data-card-kind")));

  expect(new Set(kinds)).toEqual(new Set(["note", "link"]));

  if (viewport === "desktop") {
    expect(new Set(boxes.map((box) => box.x)).size).toBeGreaterThanOrEqual(3);
  } else {
    expect(Math.max(...boxes.map((box) => box.x)) - Math.min(...boxes.map((box) => box.x))).toBeLessThanOrEqual(2);
    expect(boxes[1]?.y).toBeGreaterThan(boxes[0]?.y ?? 0);
  }
}

async function expectShowroomColumns(page: Page, viewport: "desktop" | "mobile") {
  const layout = await page.evaluate(() => {
    const showroom = document.querySelector<HTMLElement>("[data-testid='public-home-showroom']");

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

async function expectSearchLayout(page: Page, viewport: "desktop" | "mobile") {
  const field = page.locator(".public-search-field");
  const summary = page.locator("[data-testid='public-home-search-summary']");
  const fieldBox = await getBox(field);
  const summaryBox = await getBox(summary);

  if (viewport === "desktop") {
    expect(summaryBox.x).toBeGreaterThan(fieldBox.x + fieldBox.width - 24);
  } else {
    expect(summaryBox.y).toBeGreaterThan(fieldBox.y + fieldBox.height - 8);
    expect(Math.abs(summaryBox.x - fieldBox.x)).toBeLessThanOrEqual(2);
  }
}

async function expectCollapsedSearchLayout(page: Page, viewport: "desktop" | "mobile") {
  const toggle = page.getByTestId("public-home-search-toggle");
  const summary = page.locator("[data-testid='public-home-search-summary']");
  const toggleBox = await getBox(toggle);
  const summaryBox = await getBox(summary);

  if (viewport === "desktop") {
    expect(summaryBox.x).toBeGreaterThan(toggleBox.x + toggleBox.width - 24);
  } else {
    expect(summaryBox.y).toBeGreaterThan(toggleBox.y + toggleBox.height - 8);
    expect(Math.abs(summaryBox.x - toggleBox.x)).toBeLessThanOrEqual(2);
  }
}

async function expectPublicTasteFoundation(page: Page) {
  const audit = await page.evaluate(() => {
    const searchShell = document.querySelector(".public-search-shell");
    const homeHeading = document.querySelector(".public-intro-panel h1");
    const cards = Array.from(document.querySelectorAll<HTMLElement>("[data-testid='public-home-showroom'] .note-preview-card"));
    const tags = Array.from(document.querySelectorAll<HTMLElement>("[data-testid='public-home-showroom'] .tag-pill"));

    if (!searchShell || !homeHeading || cards.length === 0) {
      return null;
    }

    const firstCard = cards[0];
    const firstCardTitle = firstCard.querySelector<HTMLElement>(".note-list-link");
    const searchShellStyle = getComputedStyle(searchShell);

    return {
      cardRadius: Number.parseFloat(getComputedStyle(firstCard).borderTopLeftRadius),
      chipOverflowCount: tags.filter((tag) => tag.scrollWidth > tag.clientWidth + 1 || tag.scrollHeight > tag.clientHeight + 1).length,
      firstCardTitleSize: firstCardTitle ? Number.parseFloat(getComputedStyle(firstCardTitle).fontSize) : 0,
      headingSize: Number.parseFloat(getComputedStyle(homeHeading).fontSize),
      searchShellShadow: searchShellStyle.boxShadow
    };
  });

  expect(audit).not.toBeNull();

  if (!audit) {
    return;
  }

  expect(audit.headingSize).toBeLessThan(26);
  expect(audit.firstCardTitleSize).toBeGreaterThan(audit.headingSize - 4);
  expect(audit.cardRadius).toBeGreaterThanOrEqual(20);
  expect(audit.searchShellShadow).toBe("none");
  expect(audit.chipOverflowCount).toBe(0);
}

test.describe.configure({ mode: "serial" });

test.beforeEach(async () => {
  await seedPublicShowroomContent();
});

test.afterAll(async () => {
  await prisma.$disconnect();
});

test("@ui-regression @ui-public-showroom @ui-public-showroom-masonry @ui-public-search-collapse @ui-public-taste-foundation mixed public showroom keeps search collapsed by default on desktop", async ({ page }) => {
  await page.setViewportSize(desktopViewport);
  await page.goto("/");

  const showroomCards = page.locator("[data-testid='public-home-showroom'] .note-preview-card");
  const searchToggle = page.getByRole("button", { name: "Open public title search" });
  const searchInput = page.getByRole("searchbox", { name: "Search public titles" });

  await expect(page.getByTestId("public-home-layout")).toBeVisible();
  await expect(searchToggle).toBeVisible();
  await expect(searchInput).toHaveCount(0);
  await expect(showroomCards).toHaveCount(seededPublishedNotes.length + seededPublishedLinks.length);
  await expect(page.getByRole("link", { name: seededPublishedNotes[0].title })).toBeVisible();
  await expect(page.getByRole("link", { name: seededPublishedLinks[0].title })).toBeVisible();
  await expect(page.getByText("Opens in new tab")).toHaveCount(seededPublishedLinks.length);
  await expect(page.getByTestId("public-home-search-summary")).toHaveText("Title-only filter across 4 public items.");
  await expectShowroomColumns(page, "desktop");
  await expectMixedFeedRhythm(page, "desktop");
  await expectCollapsedSearchLayout(page, "desktop");
  await expectPublicTasteFoundation(page);
  await expectAccessibleStructure(page);
  await expectNoHorizontalOverflow(page);

  await expect(page.getByTestId("public-home-layout")).toHaveScreenshot("ui-public-showroom-desktop.png", {
    animations: "disabled",
    maxDiffPixelRatio: 0.02
  });

  await searchToggle.click();
  await expect(searchInput).toBeVisible();
  await expect(page.getByRole("button", { name: "Close public title search" })).toBeVisible();
  await expect(page.getByTestId("public-home-search-summary")).toHaveText("Showing all 4 public items.");
  await expectSearchLayout(page, "desktop");

  await searchInput.fill("needle");

  await expect(showroomCards).toHaveCount(2);
  await expect(page.getByRole("link", { name: seededPublishedNotes[1].title })).toBeVisible();
  await expect(page.getByRole("link", { name: seededPublishedLinks[1].title })).toBeVisible();
  await expect(page.getByTestId("public-home-search-summary")).toHaveText("Showing 2 of 4 public items.");
});

test("@ui-regression @ui-public-showroom @ui-public-showroom-masonry @ui-public-search-collapse mixed public showroom search expands cleanly on mobile", async ({ page }) => {
  await page.setViewportSize(mobileViewport);
  await page.goto("/");

  const showroomCards = page.locator("[data-testid='public-home-showroom'] .note-preview-card");
  const searchToggle = page.getByRole("button", { name: "Open public title search" });
  const searchInput = page.getByRole("searchbox", { name: "Search public titles" });

  await expect(page.getByTestId("public-home-layout")).toBeVisible();
  await expect(searchToggle).toBeVisible();
  await expect(searchInput).toHaveCount(0);
  await expect(showroomCards).toHaveCount(seededPublishedNotes.length + seededPublishedLinks.length);
  await expect(page.getByRole("link", { name: seededPublishedNotes[0].title })).toBeVisible();
  await expect(page.getByRole("link", { name: seededPublishedLinks[0].title })).toBeVisible();
  await expectShowroomColumns(page, "mobile");
  await expectMixedFeedRhythm(page, "mobile");
  await expect(page.getByTestId("public-home-search-summary")).toHaveText("Title-only filter across 4 public items.");
  await expectCollapsedSearchLayout(page, "mobile");
  await expectAccessibleStructure(page);
  await expectNoHorizontalOverflow(page);

  await expect(page.getByTestId("public-home-layout")).toHaveScreenshot("ui-public-showroom-mobile.png", {
    animations: "disabled",
    maxDiffPixelRatio: 0.02
  });

  await searchToggle.click();
  await expect(searchInput).toBeVisible();
  await expect(page.getByRole("button", { name: "Close public title search" })).toBeVisible();
  await expectSearchLayout(page, "mobile");

  await searchInput.fill("needle");

  await expect(page).toHaveURL(/\/$/);
  await expect(showroomCards).toHaveCount(2);
  await expect(page.getByRole("link", { name: seededPublishedNotes[1].title })).toBeVisible();
  await expect(page.getByRole("link", { name: seededPublishedLinks[1].title })).toBeVisible();
  await expect(page.getByTestId("public-home-search-summary")).toHaveText("Showing 2 of 4 public items.");
  await expectAccessibleStructure(page);
  await expectNoHorizontalOverflow(page);
});
