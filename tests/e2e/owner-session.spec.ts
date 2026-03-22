import "dotenv/config";

import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";
import { expect, test, type Page } from "@playwright/test";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL must be set before running owner session continuity tests.");
}

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({
    url: databaseUrl
  })
});

const seededNote = {
  title: "Owner continuity public note",
  slug: "owner-continuity-public-note",
  markdown: "# Owner continuity public note",
  excerpt: "A published note that supports public-to-private continuity coverage.",
  publishedAt: new Date("2024-06-18T09:30:00.000Z")
} as const;

async function seedOwnerContinuityFixture() {
  const username = process.env.OWNER_USERNAME ?? "owner";
  const owner = await prisma.user.findUnique({
    where: {
      username
    }
  });

  if (!owner) {
    throw new Error(`Owner account '${username}' must exist before owner session continuity tests run.`);
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
      enrichmentStatus: "ready",
      isPublished: true,
      publishedAt: seededNote.publishedAt,
      createdAt: seededNote.publishedAt,
      updatedAt: seededNote.publishedAt
    }
  });
}

async function signInAsOwner(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Username").fill(process.env.OWNER_USERNAME ?? "owner");
  await page.getByLabel("Password").fill(process.env.OWNER_PASSWORD ?? "minakeep-local-password");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/app$/);
}

test.describe.configure({ mode: "serial" });

test.beforeEach(async () => {
  await seedOwnerContinuityFixture();
});

test.afterAll(async () => {
  await prisma.$disconnect();
});

// Protect the public/private split: anonymous visitors keep the login affordance,
// while an authenticated owner keeps a direct path back into the workspace.
test("@owner-session anonymous public routes keep owner controls hidden", async ({ page }) => {
  await page.goto("/");

  const primaryNav = page.getByRole("navigation", { name: "Primary" });

  await expect(primaryNav.getByRole("link", { name: "Owner login" })).toBeVisible();
  await expect(primaryNav.getByRole("link", { name: "Owner workspace" })).toHaveCount(0);

  await page.goto(`/notes/${seededNote.slug}`);

  await expect(primaryNav.getByRole("link", { name: "Owner login" })).toBeVisible();
  await expect(primaryNav.getByRole("link", { name: "Owner workspace" })).toHaveCount(0);
});

test("@owner-session authenticated owner keeps continuity across app and public routes", async ({ page }) => {
  await signInAsOwner(page);

  const primaryNav = page.getByRole("navigation", { name: "Primary" });

  await primaryNav.getByRole("link", { name: "Published notes" }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(primaryNav.getByRole("link", { name: "Owner workspace" })).toBeVisible();
  await expect(primaryNav.getByRole("link", { name: "Owner workspace" })).toHaveAttribute("href", "/app");
  await expect(primaryNav.getByRole("link", { name: "Owner login" })).toHaveCount(0);

  await page.getByRole("link", { name: seededNote.title }).click();
  await expect(page).toHaveURL(new RegExp(`/notes/${seededNote.slug}$`));
  await expect(primaryNav.getByRole("link", { name: "Owner workspace" })).toBeVisible();
  await expect(primaryNav.getByRole("link", { name: "Owner login" })).toHaveCount(0);

  await primaryNav.getByRole("link", { name: "Owner workspace" }).click();
  await expect(page).toHaveURL(/\/app$/);
  await expect(page.getByRole("link", { name: "New note" })).toBeVisible();
});
