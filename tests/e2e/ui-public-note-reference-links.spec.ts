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
  throw new Error("DATABASE_URL must be set before running UI public note reference-link tests.");
}

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({
    url: databaseUrl
  })
});

const seededNote = {
  title: "Published references should read like calm citations",
  slug: "published-references-should-read-like-calm-citations",
  markdown: `## Reference links should support the reading flow

Dense notes can cite the studio roadmap[^roadmap] without dragging raw URLs into the prose.

The same source can appear again[^roadmap] when the note returns to the same idea, while a second source[^spec] stays distinct.

### The bottom section should stay easy to scan

Readers should be able to jump from the inline marker to the matching source without losing the article rhythm.

[^roadmap]: [Studio roadmap memo](https://example.com/roadmap)
[^spec]: [Reference-link surface specification](https://example.com/reference-link-spec)`,
  publishedAt: new Date("2024-06-04T10:15:00.000Z"),
  summary: "Published notes should render reference markers inline and collect the underlying sources into one calm references block.",
  tags: ["references", "public notes", "reading"]
} as const;

async function seedPublishedNote() {
  const username = process.env.OWNER_USERNAME ?? "owner";
  const owner = await prisma.user.findUnique({
    where: {
      username
    }
  });

  if (!owner) {
    throw new Error(`Owner account '${username}' must exist before UI public note reference-link tests run.`);
  }

  await prisma.note.deleteMany({
    where: {
      ownerId: owner.id
    }
  });

  await prisma.note.create({
    data: {
      enrichmentStatus: "ready",
      excerpt: "Published reference links should read like calm citations instead of raw footnote syntax.",
      isPublished: true,
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
      title: seededNote.title
    }
  });
}

async function expectNoHorizontalOverflow(page: Page) {
  const hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);

  expect(hasOverflow).toBe(false);
}

async function expectReferenceSurface(page: Page, viewport: "desktop" | "mobile") {
  const metrics = await page.evaluate(() => {
    const body = document.querySelector<HTMLElement>("[data-testid='public-note-markdown']");
    const markers = Array.from(document.querySelectorAll<HTMLElement>("[data-testid='public-note-markdown'] .markdown-reference-marker-link"));
    const section = document.querySelector<HTMLElement>("[data-testid='public-note-markdown'] .markdown-reference-section");
    const entries = Array.from(document.querySelectorAll<HTMLElement>("[data-testid='public-note-markdown'] .markdown-reference-list-item"));
    const links = Array.from(document.querySelectorAll<HTMLElement>("[data-testid='public-note-markdown'] .markdown-reference-link"));

    if (!body || !section || markers.length === 0 || entries.length === 0 || links.length === 0) {
      throw new Error("Expected public note reference-link anchors to exist.");
    }

    const bodyRect = body.getBoundingClientRect();
    const sectionRect = section.getBoundingClientRect();

    return {
      bodyWidth: Math.round(bodyRect.width),
      entryWidths: entries.map((entry) => Math.round(entry.getBoundingClientRect().width)),
      linkTargets: links.map((link) => link.getAttribute("target")),
      markerHeights: markers.map((marker) => Math.round(marker.getBoundingClientRect().height)),
      markerWidths: markers.map((marker) => Math.round(marker.getBoundingClientRect().width)),
      sectionWidth: Math.round(sectionRect.width)
    };
  });

  expect(metrics.sectionWidth).toBeLessThanOrEqual(metrics.bodyWidth + 1);

  for (const width of metrics.entryWidths) {
    expect(width).toBeLessThanOrEqual(metrics.sectionWidth + 1);
  }

  for (const width of metrics.markerWidths) {
    expect(width).toBeGreaterThanOrEqual(viewport === "desktop" ? 22 : 24);
  }

  for (const height of metrics.markerHeights) {
    expect(height).toBeGreaterThanOrEqual(viewport === "desktop" ? 22 : 24);
  }

  for (const target of metrics.linkTargets) {
    expect(target).toBe("_blank");
  }
}

async function expectReferenceNavigation(page: Page, containerTestId: string) {
  const firstMarker = page.locator(`[data-testid='${containerTestId}'] .markdown-reference-marker-link`).first();
  const targetId = await firstMarker.getAttribute("href");

  expect(targetId).toBeTruthy();

  await firstMarker.click();
  await expect(page).toHaveURL(new RegExp(`${targetId?.replace("#", "#")}$`));

  const targetVisible = await page.evaluate((selector) => {
    const target = document.querySelector<HTMLElement>(selector);

    if (!target) {
      return false;
    }

    const rect = target.getBoundingClientRect();
    return rect.top >= 0 && rect.top <= window.innerHeight;
  }, targetId ?? "");

  expect(targetVisible).toBe(true);
}

test.describe.configure({ mode: "serial" });

test.beforeEach(async () => {
  await seedPublishedNote();
});

test.afterAll(async () => {
  await prisma.$disconnect();
});

test("@ui-public-note-reference-links @ui-reference-link-regression published note renders reference markers and bottom references on desktop", async ({
  page
}) => {
  await page.setViewportSize(desktopViewport);
  await page.goto(`/notes/${seededNote.slug}`);

  const noteBody = page.getByTestId("public-note-markdown");
  const markers = noteBody.locator(".markdown-reference-marker-link");
  const referenceSection = noteBody.locator(".markdown-reference-section");
  const referenceEntries = noteBody.locator(".markdown-reference-list-item");

  await expect(page.getByRole("heading", { name: seededNote.title })).toBeVisible();
  await expect(noteBody.getByRole("heading", { name: "Reference links should support the reading flow" })).toBeVisible();
  await expect(markers).toHaveCount(3);
  await expect(referenceSection.getByText("Supporting sources")).toBeVisible();
  await expect(referenceSection.getByRole("heading", { exact: true, name: "References" })).toBeVisible();
  await expect(referenceEntries).toHaveCount(2);
  await expect(referenceSection.getByRole("link", { name: "Studio roadmap memo" })).toHaveAttribute("href", "https://example.com/roadmap");
  await expect(referenceSection.getByRole("link", { name: "Reference-link surface specification" })).toHaveAttribute(
    "href",
    "https://example.com/reference-link-spec"
  );
  await expect(referenceSection.getByRole("link", { name: "Studio roadmap memo" })).toHaveAttribute("target", "_blank");
  await expect(noteBody).not.toContainText("[^roadmap]: [Studio roadmap memo]");
  await expect(noteBody).not.toContainText("[^spec]: [Reference-link surface specification]");
  await expectReferenceSurface(page, "desktop");
  await expectReferenceNavigation(page, "public-note-markdown");
  await expectNoHorizontalOverflow(page);

  await expect(page.locator(".public-note-card")).toHaveScreenshot("ui-public-note-reference-links-desktop.png", {
    animations: "disabled",
    maxDiffPixels: 1000
  });
});

test("@ui-public-note-reference-links @ui-reference-link-regression published note keeps references bounded and tappable on mobile", async ({
  page
}) => {
  await page.setViewportSize(mobileViewport);
  await page.goto(`/notes/${seededNote.slug}`);

  const noteBody = page.getByTestId("public-note-markdown");
  const markers = noteBody.locator(".markdown-reference-marker-link");
  const referenceSection = noteBody.locator(".markdown-reference-section");

  await expect(page.getByRole("heading", { name: seededNote.title })).toBeVisible();
  await expect(markers).toHaveCount(3);
  await expect(referenceSection.getByRole("heading", { exact: true, name: "References" })).toBeVisible();
  await expect(referenceSection.getByRole("link", { name: "Studio roadmap memo" })).toBeVisible();
  await expect(referenceSection.getByRole("link", { name: "Reference-link surface specification" })).toBeVisible();
  await expectReferenceSurface(page, "mobile");
  await expectReferenceNavigation(page, "public-note-markdown");
  await expectNoHorizontalOverflow(page);

  await expect(page.locator(".public-note-card")).toHaveScreenshot("ui-public-note-reference-links-mobile.png", {
    animations: "disabled",
    maxDiffPixels: 1000
  });
});
