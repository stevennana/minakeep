import "dotenv/config";

import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";
import { expect, test } from "@playwright/test";

import { setPublicSiteUrlPlaywrightTestMode } from "./public-site-test-mode";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL must be set before running SEO discovery tests.");
}

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({
    url: databaseUrl
  })
});

const configuredOrigin = "http://127.0.0.1:3100";
const seedId = `seo-discovery-${Date.now()}`;
const seededPublishedNote = {
  title: `SEO published note ${seedId}`,
  slug: `seo-published-note-${seedId}`,
  markdown: `# SEO published note ${seedId}\n\nThis note should appear in the sitemap.`,
  excerpt: `Published SEO excerpt ${seedId}.`
};
const seededDraftNote = {
  title: `SEO draft note ${seedId}`,
  slug: `seo-draft-note-${seedId}`,
  markdown: `# SEO draft note ${seedId}`,
  excerpt: `Draft SEO excerpt ${seedId}.`
};
const seededPublishedLink = {
  title: `SEO published link ${seedId}`,
  url: `https://example.com/seo-published-link-${seedId}`
};

function getOwnerUsername() {
  return process.env.OWNER_USERNAME ?? "owner";
}

function extractLocs(xml: string) {
  return Array.from(xml.matchAll(/<loc>(.*?)<\/loc>/g), (match) => match[1] ?? "");
}

async function getOwnerId() {
  const owner = await prisma.user.findUnique({
    where: {
      username: getOwnerUsername()
    },
    select: {
      id: true
    }
  });

  if (!owner) {
    throw new Error(`Expected seeded owner "${getOwnerUsername()}" to exist before SEO discovery tests.`);
  }

  return owner.id;
}

async function seedSeoDiscoveryContent() {
  const ownerId = await getOwnerId();
  const publishedAt = new Date("2026-03-23T09:00:00.000Z");

  await prisma.note.create({
    data: {
      ownerId,
      title: seededPublishedNote.title,
      slug: seededPublishedNote.slug,
      markdown: seededPublishedNote.markdown,
      excerpt: seededPublishedNote.excerpt,
      summary: "A published note seeded for sitemap coverage.",
      isPublished: true,
      publishedAt
    }
  });

  await prisma.note.create({
    data: {
      ownerId,
      title: seededDraftNote.title,
      slug: seededDraftNote.slug,
      markdown: seededDraftNote.markdown,
      excerpt: seededDraftNote.excerpt,
      summary: "A draft note seeded to prove sitemap exclusion.",
      isPublished: false
    }
  });

  await prisma.link.create({
    data: {
      ownerId,
      url: seededPublishedLink.url,
      title: seededPublishedLink.title,
      summary: "A published link seeded to prove homepage-only public visibility.",
      isPublished: true,
      publishedAt
    }
  });
}

async function cleanupSeoDiscoveryContent() {
  await prisma.link.deleteMany({
    where: {
      OR: [
        {
          url: seededPublishedLink.url
        },
        {
          title: seededPublishedLink.title
        }
      ]
    }
  });

  await prisma.note.deleteMany({
    where: {
      slug: {
        in: [seededPublishedNote.slug, seededDraftNote.slug]
      }
    }
  });
}

test.describe.configure({ mode: "serial" });

test.beforeAll(async () => {
  await cleanupSeoDiscoveryContent();
  await seedSeoDiscoveryContent();
});

test.afterEach(async () => {
  await setPublicSiteUrlPlaywrightTestMode("passthrough");
});

test.afterAll(async () => {
  await setPublicSiteUrlPlaywrightTestMode("passthrough");
  await cleanupSeoDiscoveryContent();
  await prisma.$disconnect();
});

test("@seo-discovery robots and sitemap fail closed when the canonical public origin is missing", async ({ page }) => {
  await setPublicSiteUrlPlaywrightTestMode(null);

  const robotsResponse = await page.request.get("/robots.txt");
  expect(robotsResponse.ok()).toBe(true);
  const robotsText = await robotsResponse.text();
  expect(robotsText).toContain("User-Agent: *");
  expect(robotsText).toContain("Disallow: /");
  expect(robotsText).not.toContain("Sitemap:");

  const sitemapResponse = await page.request.get("/sitemap.xml");
  expect(sitemapResponse.ok()).toBe(true);
  const sitemapText = await sitemapResponse.text();
  expect(sitemapText).toContain("<urlset");
  expect(extractLocs(sitemapText)).toEqual([]);

  await page.goto("/");
  await expect(page.locator("link[rel='canonical']")).toHaveCount(0);

  await page.goto(`/notes/${seededPublishedNote.slug}`);
  await expect(page.locator("link[rel='canonical']")).toHaveCount(0);
});

test("@seo-discovery configured origin drives public robots, sitemap, and canonical metadata", async ({ page }) => {
  await setPublicSiteUrlPlaywrightTestMode(configuredOrigin);

  const robotsResponse = await page.request.get("/robots.txt");
  expect(robotsResponse.ok()).toBe(true);
  const robotsText = await robotsResponse.text();
  expect(robotsText).toContain("User-Agent: *");
  expect(robotsText).toContain("Allow: /");
  expect(robotsText).toContain(`Sitemap: ${configuredOrigin}/sitemap.xml`);

  const sitemapResponse = await page.request.get("/sitemap.xml");
  expect(sitemapResponse.ok()).toBe(true);
  const sitemapText = await sitemapResponse.text();
  const sitemapLocs = extractLocs(sitemapText);
  expect(sitemapLocs).toContain(`${configuredOrigin}/`);
  expect(sitemapLocs).toContain(`${configuredOrigin}/notes/${seededPublishedNote.slug}`);
  expect(sitemapLocs).not.toContain(`${configuredOrigin}/notes/${seededDraftNote.slug}`);
  expect(sitemapText).not.toContain(seededPublishedLink.url);

  for (const loc of sitemapLocs) {
    expect(loc.startsWith(configuredOrigin)).toBe(true);
    const pathname = new URL(loc).pathname;
    expect(pathname === "/" || pathname.startsWith("/notes/")).toBe(true);
  }

  await page.goto("/");
  await expect(page.locator("link[rel='canonical']")).toHaveAttribute("href", `${configuredOrigin}/`);

  await page.goto(`/notes/${seededPublishedNote.slug}`);
  await expect(page.locator("link[rel='canonical']")).toHaveAttribute("href", `${configuredOrigin}/notes/${seededPublishedNote.slug}`);
});
