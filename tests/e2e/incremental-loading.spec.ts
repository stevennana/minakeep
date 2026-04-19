import "dotenv/config";

import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";
import { expect, test, type Page } from "@playwright/test";

const databaseUrl = process.env.DATABASE_URL?.startsWith("file:./")
  ? "file:" + process.cwd() + "/" + process.env.DATABASE_URL.slice("file:./".length)
  : process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL must be set before running incremental loading UI tests.");
}

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({
    url: databaseUrl
  })
});

function ownerCredentials() {
  return {
    password: process.env.OWNER_PASSWORD ?? "password",
    username: process.env.OWNER_USERNAME ?? "owner"
  };
}

function buildDate(offset: number) {
  return new Date(Date.UTC(2026, 2, 26, 12, 0, 0) - offset * 60_000);
}

async function seedIncrementalLoadingFixtures() {
  const { username } = ownerCredentials();
  const owner = await prisma.user.findUnique({
    where: {
      username
    }
  });

  if (!owner) {
    throw new Error(`Owner account '${username}' must exist before incremental loading tests run.`);
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

  for (let index = 0; index < 24; index += 1) {
    const published = index < 12;
    const createdAt = buildDate(index);

    await prisma.note.create({
      data: {
        ownerId: owner.id,
        title: published ? `Public note load case ${String(index + 1).padStart(2, "0")}` : `Private note load case ${String(index + 1).padStart(2, "0")}`,
        slug: `incremental-note-${index + 1}`,
        markdown: `# Incremental note ${index + 1}`,
        excerpt: `Incremental note excerpt ${index + 1}`,
        summary: published ? `Published note summary ${index + 1}` : `Private note summary ${index + 1}`,
        enrichmentStatus: "ready",
        enrichmentError: null,
        enrichmentAttempts: 1,
        enrichmentUpdatedAt: createdAt,
        isPublished: published,
        publishedAt: published ? createdAt : null,
        createdAt,
        updatedAt: createdAt
      }
    });
  }

  for (let index = 0; index < 22; index += 1) {
    const published = index < 11;
    const createdAt = buildDate(100 + index);

    await prisma.link.create({
      data: {
        ownerId: owner.id,
        title: published ? `Public link load case ${String(index + 1).padStart(2, "0")}` : `Private link load case ${String(index + 1).padStart(2, "0")}`,
        url: `https://example.com/incremental-link-${index + 1}`,
        summary: `Incremental link summary ${index + 1}`,
        enrichmentStatus: "ready",
        enrichmentError: null,
        enrichmentAttempts: 1,
        enrichmentUpdatedAt: createdAt,
        isPublished: published,
        publishedAt: published ? createdAt : null,
        createdAt,
        updatedAt: createdAt
      }
    });
  }

  return owner.id;
}

async function signIn(page: Page) {
  const { password, username } = ownerCredentials();

  await page.goto("/login");
  await page.getByLabel("Username").fill(username);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/app$/);
}

async function getFirstCardRowOrder(page: Page, count: number) {
  return page.evaluate((visibleCount) => {
    const cards = Array.from(document.querySelectorAll<HTMLElement>("[data-testid='public-home-showroom'] .note-preview-card")).slice(0, visibleCount);

    return cards.map((card) => {
      const rect = card.getBoundingClientRect();

      return {
        title: card.querySelector(".note-list-link")?.textContent?.trim() ?? "",
        x: Math.round(rect.x),
        y: Math.round(rect.y)
      };
    });
  }, count);
}

let ownerId: string;

test.describe.configure({ mode: "serial" });

test.beforeEach(async () => {
  ownerId = await seedIncrementalLoadingFixtures();
});

test.afterAll(async () => {
  await prisma.$disconnect();
});

test("@incremental-loading public and owner collections use bounded initial slices with automatic continuation", async ({ page }) => {
  await page.goto("/");

  const publicCards = page.locator("[data-testid='public-home-showroom'] .note-preview-card");

  await expect(publicCards).toHaveCount(10);
  await expect.poll(async () => page.getByTestId("public-home-showroom").getAttribute("data-masonry-ready")).toBe("true");

  const firstRowBeforeLoadMore = await getFirstCardRowOrder(page, 4);

  expect(firstRowBeforeLoadMore.map((card) => card.x)).toEqual(
    [...firstRowBeforeLoadMore.map((card) => card.x)].sort((left, right) => left - right)
  );

  await expect(page.getByTestId("public-home-load-more")).toBeVisible();

  await page.getByTestId("public-home-load-more").scrollIntoViewIfNeeded();
  await expect.poll(async () => publicCards.count()).toBe(20);
  await expect(page).toHaveURL(/limit=20/);

  const firstRowAfterLoadMore = await getFirstCardRowOrder(page, 4);

  expect(firstRowAfterLoadMore.map((card) => card.title)).toEqual(firstRowBeforeLoadMore.map((card) => card.title));
  expect(firstRowAfterLoadMore.map((card) => card.x)).toEqual(
    [...firstRowAfterLoadMore.map((card) => card.x)].sort((left, right) => left - right)
  );

  await page.getByRole("button", { name: "Open public title search" }).click();
  await page.getByRole("searchbox", { name: "Search public titles" }).fill("Public note load case");
  await expect(page.getByTestId("public-home-search-summary")).toHaveText("Showing 10 of 12 public items.");
  await expect(publicCards).toHaveCount(10);

  await page.getByTestId("public-home-load-more").scrollIntoViewIfNeeded();
  await expect.poll(async () => publicCards.count()).toBe(12);
  await expect(page).toHaveURL(/q=Public\+note\+load\+case/);

  await signIn(page);

  const ownerNotes = page.locator("[data-testid='owner-dashboard-note-list'] article");

  await expect(ownerNotes).toHaveCount(20);
  await page.getByTestId("owner-notes-load-more").scrollIntoViewIfNeeded();
  await expect.poll(async () => ownerNotes.count()).toBe(24);
  await expect(page).toHaveURL(/\/app\?limit=24$/);

  await page.getByRole("navigation", { name: "Private vault sections" }).getByRole("link", { name: "Links" }).click();
  await expect(page).toHaveURL(/\/app\/links$/);

  const ownerLinks = page.locator(".link-list article");

  await expect(ownerLinks).toHaveCount(20);
  const totalOwnerLinks = await prisma.link.count({
    where: {
      ownerId
    }
  });
  await page.getByTestId("owner-links-load-more").scrollIntoViewIfNeeded();
  await expect.poll(async () => ownerLinks.count()).toBe(totalOwnerLinks);
  await expect(page).toHaveURL(new RegExp(`/app/links\\?limit=${totalOwnerLinks}$`));
});
