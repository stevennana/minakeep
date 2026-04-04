import "dotenv/config";

import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";
import { expect, test, type Page } from "@playwright/test";

const databaseUrl = process.env.DATABASE_URL?.startsWith("file:./")
  ? "file:" + process.cwd() + "/" + process.env.DATABASE_URL.slice("file:./".length)
  : process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL must be set before running ui information density tests.");
}

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({
    url: databaseUrl
  })
});

function getOwnerCredentials() {
  return {
    username: process.env.OWNER_USERNAME ?? "owner",
    password: process.env.OWNER_PASSWORD ?? "password"
  };
}

async function seedUiDensityContent() {
  const { username } = getOwnerCredentials();
  const owner = await prisma.user.findUnique({
    where: {
      username
    }
  });

  if (!owner) {
    throw new Error(`Owner account '${username}' must exist before ui information density tests run.`);
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
      title: "Quieter dashboard note",
      slug: "quieter-dashboard-note",
      markdown: "# Quieter dashboard note",
      excerpt: "The interface should not force the owner to read a panel before taking obvious actions.",
      summary: "A quieter workspace keeps actions visible and trust cues secondary.",
      enrichmentStatus: "ready",
      enrichmentAttempts: 1,
      enrichmentUpdatedAt: new Date("2024-09-01T09:00:00.000Z"),
      isPublished: true,
      publishedAt: new Date("2024-09-01T09:05:00.000Z"),
      createdAt: new Date("2024-09-01T09:00:00.000Z"),
      updatedAt: new Date("2024-09-01T09:05:00.000Z"),
      tags: {
        connectOrCreate: [
          {
            where: {
              name: "density"
            },
            create: {
              name: "density"
            }
          }
        ]
      }
    }
  });

  await prisma.link.create({
    data: {
      ownerId: owner.id,
      title: "Lighter disclosure reference",
      url: "https://example.com/lighter-disclosure-reference",
      summary: "Keep optional guidance available without wrapping every action in explanation-first copy.",
      enrichmentStatus: "ready",
      enrichmentAttempts: 1,
      enrichmentUpdatedAt: new Date("2024-09-02T09:00:00.000Z"),
      isPublished: true,
      publishedAt: new Date("2024-09-02T09:05:00.000Z"),
      createdAt: new Date("2024-09-02T09:00:00.000Z"),
      updatedAt: new Date("2024-09-02T09:05:00.000Z"),
      tags: {
        connectOrCreate: [
          {
            where: {
              name: "showroom"
            },
            create: {
              name: "showroom"
            }
          }
        ]
      }
    }
  });
}

async function signIn(page: Page) {
  const { username, password } = getOwnerCredentials();

  await page.goto("/login");
  await page.getByLabel("Username").fill(username);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/app$/);
}

test.describe.configure({ mode: "serial" });

test.beforeEach(async () => {
  await seedUiDensityContent();
});

test.afterAll(async () => {
  await prisma.$disconnect();
});

test("@ui-information-density @ui-refinement-hardening login and dashboard remove implementation-heavy helper copy", async ({ page }) => {
  await page.goto("/login");

  await expect(page.getByRole("heading", { name: "Sign in to the private vault" })).toBeVisible();
  await expect(page.getByText("Owner editing access and read-only demo access to notes, links, tags, and search.")).toBeVisible();
  await expect(page.getByText("db:prepare")).toHaveCount(0);
  await expect(page.getByText("/app")).toHaveCount(0);
  await expect(page.getByText("seeded", { exact: false })).toHaveCount(0);

  await signIn(page);

  await expect(page.getByText("Reopen drafts quickly", { exact: false })).toHaveCount(0);
  await expect(page.getByText("Links, tags, and search remain in the owner shell", { exact: false })).toHaveCount(0);
  await expect(page.getByLabel("Dashboard overview")).toContainText("All notes");
  await expect(page.getByLabel("Dashboard overview")).toContainText("On the public site");
});

test("@ui-information-density @ui-refinement-hardening public search keeps title scope obvious without redundant disclosure copy", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByTestId("public-home-search-summary")).toHaveText("2 public items.");
  await expect(page.getByText("Title-only filter across", { exact: false })).toHaveCount(0);

  await page.getByRole("button", { name: "Open public title search" }).click();

  await expect(page.getByText("Title only")).toHaveCount(0);
  await expect(page.getByText("Matches published note and link titles.")).toHaveCount(0);
  await expect(page.getByPlaceholder("Search public titles")).toBeVisible();
  await expect(page.getByRole("button", { name: "Close public title search" })).toBeVisible();
});

test("@ui-information-density @ui-refinement-hardening owner secondary surfaces move guidance into compact disclosures", async ({ page }) => {
  await signIn(page);

  await page.goto("/app/search");
  await expect(page.getByText("Search scope")).toBeVisible();
  await expect(page.getByText("Public readers do not get a search interface in v1.")).toHaveCount(0);

  await page.goto("/app/links");
  await expect(page.getByText("After save")).toBeVisible();
  await expect(page.getByText("AI summary and shared tags are generated automatically after save.")).toHaveCount(0);

  await page.goto("/app");
  await expect(page.getByRole("link", { name: "Quieter dashboard note" })).toBeVisible();
  await page.getByRole("link", { name: "Quieter dashboard note" }).click();
  await expect(page).toHaveURL(/\/app\/notes\/.+\/edit$/);
  await expect(page.getByLabel("Note editor overview")).toContainText("Markdown-first");
  await expect(page.getByText("Drafting surface")).toHaveCount(0);
  await expect(page.getByText("Publishing")).toHaveCount(0);
  await expect(page.getByText("AI metadata")).toHaveCount(0);
});
