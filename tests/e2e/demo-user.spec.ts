import "dotenv/config";

import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";
import { expect, test, type Page } from "@playwright/test";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL must be set before running demo-user tests.");
}

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({
    url: databaseUrl
  })
});

const seededNote = {
  excerpt: "A seeded owner note that proves the demo user is reading real workspace content.",
  markdown: "# Demo workspace note",
  slug: "demo-workspace-note",
  title: "Demo workspace note",
  updatedAt: new Date("2024-07-12T08:15:00.000Z")
} as const;

const seededLink = {
  summary: "A seeded owner link that stays visible while demo mutation controls remain disabled.",
  title: "Demo workspace link",
  updatedAt: new Date("2024-07-13T09:45:00.000Z"),
  url: "https://example.com/demo-workspace-link"
} as const;

async function seedDemoWorkspaceFixture() {
  const owner = await prisma.user.findUnique({
    where: {
      username: process.env.OWNER_USERNAME ?? "owner"
    }
  });

  if (!owner) {
    throw new Error("The seeded owner account must exist before demo-user tests run.");
  }

  await prisma.note.deleteMany({
    where: {
      ownerId: owner.id,
      slug: seededNote.slug
    }
  });

  await prisma.link.deleteMany({
    where: {
      ownerId: owner.id,
      url: seededLink.url
    }
  });

  const note = await prisma.note.create({
    data: {
      createdAt: seededNote.updatedAt,
      enrichmentStatus: "ready",
      excerpt: seededNote.excerpt,
      isPublished: false,
      markdown: seededNote.markdown,
      ownerId: owner.id,
      slug: seededNote.slug,
      title: seededNote.title,
      updatedAt: seededNote.updatedAt
    }
  });

  await prisma.link.create({
    data: {
      createdAt: seededLink.updatedAt,
      enrichmentAttempts: 1,
      enrichmentError: "Seeded link failure to expose the retry control.",
      enrichmentStatus: "failed",
      enrichmentUpdatedAt: seededLink.updatedAt,
      isPublished: false,
      ownerId: owner.id,
      summary: seededLink.summary,
      title: seededLink.title,
      updatedAt: seededLink.updatedAt,
      url: seededLink.url
    }
  });

  return note;
}

async function signInAsDemo(page: Page) {
  const username = process.env.DEMO_USERNAME ?? "demo";
  const password = process.env.DEMO_PASSWORD ?? "minakeep-demo-password";

  await page.goto("/login");
  await page.getByLabel("Username").fill(username);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page).toHaveURL(/\/app$/);

  return username;
}

test.describe.configure({ mode: "serial" });

let seededNoteId = "";

test.beforeAll(async () => {
  const seeded = await seedDemoWorkspaceFixture();
  seededNoteId = seeded.id;
});

test.afterAll(async () => {
  await prisma.$disconnect();
});

test("@demo-user demo credentials authenticate a runtime demo session and reach the dashboard", async ({ page }) => {
  const username = await signInAsDemo(page);
  const ownerUsername = process.env.OWNER_USERNAME ?? "owner";
  const primaryNav = page.getByRole("navigation", { name: "Primary" });

  await expect(primaryNav.getByRole("link", { name: "Read-only workspace" })).toBeVisible();
  await expect(page.getByText("You are browsing the owner workspace in read-only mode.")).toBeVisible();
  await expect(page.getByRole("heading", { name: `${ownerUsername}’s notes` })).toBeVisible();
  await expect(page.getByRole("link", { name: seededNote.title })).toBeVisible();
  await expect(page.getByRole("button", { name: "New note unavailable" })).toBeDisabled();

  const session = await page.evaluate(async () => {
    const response = await fetch("/api/auth/session");
    return (await response.json()) as {
      user?: {
        name?: string | null;
        role?: string | null;
      };
    };
  });

  expect(session.user?.name).toBe(username);
  expect(session.user?.role).toBe("demo");
});

test("@demo-user demo workspace routes stay browsable while mutation controls are disabled", async ({ page }) => {
  await signInAsDemo(page);

  await page.goto("/app/links");
  await expect(page.getByRole("heading", { name: "Reference shelf" })).toBeVisible();
  await expect(page.getByLabel("URL")).toBeDisabled();
  await expect(page.getByLabel("Title")).toBeDisabled();
  await expect(page.getByRole("button", { name: "Save link unavailable" })).toBeDisabled();
  await expect(page.getByRole("link", { name: seededLink.title })).toBeVisible();
  const seededLinkCard = page.getByRole("article").filter({ has: page.getByRole("link", { name: seededLink.title }) });
  await expect(seededLinkCard.getByRole("button", { name: "Refresh favicon unavailable" })).toBeDisabled();
  await expect(seededLinkCard.getByRole("button", { name: "Publish unavailable" })).toBeDisabled();
  await expect(seededLinkCard.getByRole("button", { name: "Retry unavailable" })).toBeDisabled();

  await page.goto("/app/tags");
  await expect(page.getByRole("heading", { name: "Browse one private taxonomy" })).toBeVisible();
  await expect(page.getByRole("link", { name: seededNote.title })).toBeVisible();
  await expect(page.getByRole("link", { name: seededLink.title })).toBeVisible();

  await page.goto(`/app/search?q=${encodeURIComponent("Demo workspace")}`);
  await expect(page.getByRole("heading", { name: "Search the private vault" })).toBeVisible();
  await expect(page.getByLabel("Query")).toHaveValue("Demo workspace");
  await expect(page.getByRole("link", { name: seededNote.title })).toBeVisible();
  await expect(page.getByRole("link", { name: seededLink.title })).toBeVisible();

  await page.goto(`/app/notes/${seededNoteId}/edit`);
  await expect(page.getByRole("heading", { name: "Edit draft note" })).toBeVisible();
  await expect(page.getByLabel("Title")).toHaveValue(seededNote.title);
  await expect(page.getByLabel("Title")).toHaveJSProperty("readOnly", true);
  await expect(page.getByLabel("Markdown body")).toHaveValue(seededNote.markdown);
  await expect(page.getByLabel("Markdown body")).toHaveJSProperty("readOnly", true);
  await expect(page.getByRole("button", { name: "Save unavailable" })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Publish unavailable" })).toBeDisabled();
});
