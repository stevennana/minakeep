import "dotenv/config";

import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";
import { expect, test } from "@playwright/test";

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

  await prisma.note.create({
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
}

test.describe.configure({ mode: "serial" });

test.beforeAll(async () => {
  await seedDemoWorkspaceFixture();
});

test.afterAll(async () => {
  await prisma.$disconnect();
});

test("@demo-user demo credentials authenticate a runtime demo session and reach the dashboard", async ({ page }) => {
  const username = process.env.DEMO_USERNAME ?? "demo";
  const password = process.env.DEMO_PASSWORD ?? "minakeep-demo-password";
  const ownerUsername = process.env.OWNER_USERNAME ?? "owner";

  await page.goto("/login");
  await page.getByLabel("Username").fill(username);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page).toHaveURL(/\/app$/);
  await expect(page.getByRole("heading", { name: `${ownerUsername}’s notes` })).toBeVisible();
  await expect(page.getByRole("link", { name: seededNote.title })).toBeVisible();

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
