import "dotenv/config";

import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";
import { expect, test } from "@playwright/test";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL must be set before running public home search tests.");
}

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({
    url: databaseUrl
  })
});

const seededPublishedNotes = [
  {
    title: "Needle note title",
    slug: "needle-note-title",
    markdown: "# Needle note title",
    excerpt: "A published note whose title should match the public filter.",
    summary: "This note is meant to stay visible when the title matches.",
    publishedAt: new Date("2024-06-14T09:30:00.000Z"),
    tags: ["search"]
  },
  {
    title: "Archive rhythm memo",
    slug: "archive-rhythm-memo",
    markdown: "# Archive rhythm memo",
    excerpt: "The body-needle phrase lives here, but not in the title.",
    summary: null,
    publishedAt: new Date("2024-06-10T09:30:00.000Z"),
    tags: ["reading"]
  }
] as const;

const seededPublishedLinks = [
  {
    title: "Needle link title",
    url: "https://example.com/needle-link-title",
    summary: "A published link whose title should match the public filter.",
    publishedAt: new Date("2024-06-13T09:30:00.000Z"),
    tags: ["search"]
  },
  {
    title: "Field reference shelf",
    url: "https://example.com/field-reference-shelf",
    summary: "The summary-only needle phrase lives here, but not in the title.",
    publishedAt: new Date("2024-06-09T09:30:00.000Z"),
    tags: ["links"]
  }
] as const;

const seededUnsafePublishedLink = {
  title: "Unsafe script bookmark",
  url: "javascript:alert('xss')",
  summary: "This should never render on the public homepage, even if the database contains it.",
  publishedAt: new Date("2024-06-08T09:30:00.000Z"),
  tags: ["unsafe"]
} as const;

const seededUnpublishedNote = {
  title: "Needle hidden draft",
  slug: "needle-hidden-draft",
  markdown: "# Needle hidden draft",
  excerpt: "This title should never appear in the public showroom.",
  summary: "Unpublished content must stay out of public search results."
} as const;

async function seedPublicSearchContent() {
  const username = process.env.OWNER_USERNAME ?? "owner";
  const owner = await prisma.user.findUnique({
    where: {
      username
    }
  });

  if (!owner) {
    throw new Error(`Owner account '${username}' must exist before public home search tests run.`);
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

  await prisma.note.create({
    data: {
      ownerId: owner.id,
      title: seededUnpublishedNote.title,
      slug: seededUnpublishedNote.slug,
      markdown: seededUnpublishedNote.markdown,
      excerpt: seededUnpublishedNote.excerpt,
      summary: seededUnpublishedNote.summary,
      enrichmentStatus: "ready",
      isPublished: false
    }
  });

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

  await prisma.link.create({
    data: {
      ownerId: owner.id,
      title: seededUnsafePublishedLink.title,
      url: seededUnsafePublishedLink.url,
      summary: seededUnsafePublishedLink.summary,
      enrichmentStatus: "ready",
      isPublished: true,
      publishedAt: seededUnsafePublishedLink.publishedAt,
      createdAt: seededUnsafePublishedLink.publishedAt,
      updatedAt: seededUnsafePublishedLink.publishedAt,
      tags: {
        connectOrCreate: seededUnsafePublishedLink.tags.map((tag) => ({
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

test.beforeEach(async () => {
  await seedPublicSearchContent();
});

test.afterAll(async () => {
  await prisma.$disconnect();
});

test("public homepage live search filters mixed published content by title only", async ({ page }) => {
  await page.goto("/");

  const searchToggle = page.getByRole("button", { name: "Open public title search" });
  const searchInput = page.getByRole("searchbox", { name: "Search public titles" });
  const showroomCards = page.locator("[data-testid='public-home-showroom'] .note-preview-card");

  await expect(searchToggle).toBeVisible();
  await expect(searchInput).toHaveCount(0);
  await expect(page.getByRole("combobox")).toHaveCount(0);
  await expect(showroomCards).toHaveCount(seededPublishedNotes.length + seededPublishedLinks.length);
  await expect(page.getByRole("link", { name: seededPublishedNotes[0].title })).toBeVisible();
  await expect(page.getByRole("link", { name: seededPublishedLinks[0].title, exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: seededUnsafePublishedLink.title })).toHaveCount(0);

  await searchToggle.click();
  await expect(searchInput).toBeVisible();

  await searchInput.fill("NEEDLE");

  await expect(page).toHaveURL(/\/$/);
  await expect(showroomCards).toHaveCount(2);
  await expect(page.getByRole("link", { name: seededPublishedNotes[0].title })).toBeVisible();
  await expect(page.getByRole("link", { name: seededPublishedLinks[0].title, exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: seededPublishedNotes[1].title })).toHaveCount(0);
  await expect(page.getByRole("link", { name: seededPublishedLinks[1].title, exact: true })).toHaveCount(0);
  await expect(page.getByRole("link", { name: seededUnpublishedNote.title })).toHaveCount(0);
  await expect(page.getByTestId("public-home-search-summary")).toHaveText("Showing 2 of 4 public items.");

  await searchInput.fill("body-needle");

  await expect(showroomCards).toHaveCount(0);
  await expect(page.getByTestId("public-home-empty-state")).toHaveText("No published notes or links match this title.");

  await searchInput.clear();

  await expect(showroomCards).toHaveCount(seededPublishedNotes.length + seededPublishedLinks.length);
  await expect(page.getByTestId("public-home-search-summary")).toHaveText("Showing all 4 public items.");
});
