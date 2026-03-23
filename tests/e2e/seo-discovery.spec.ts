import "dotenv/config";

import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";
import { expect, test } from "@playwright/test";

import { setAiPlaywrightTestMode } from "./ai-test-mode";
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

function extractLastmodForLoc(xml: string, loc: string) {
  const urlBlock = Array.from(xml.matchAll(/<url>([\s\S]*?)<\/url>/g), (match) => match[1] ?? "").find((block) =>
    block.includes(`<loc>${loc}</loc>`)
  );

  if (!urlBlock) {
    return null;
  }

  return /<lastmod>(.*?)<\/lastmod>/.exec(urlBlock)?.[1] ?? null;
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

test("@seo-discovery sitemap homepage lastmod stays fresh after link-side public mutations", async ({ page }) => {
  await setPublicSiteUrlPlaywrightTestMode(configuredOrigin);
  await setAiPlaywrightTestMode("success");

  const username = process.env.OWNER_USERNAME ?? "owner";
  const password = process.env.OWNER_PASSWORD ?? "minakeep-local-password";
  const uniqueId = `seo-link-freshness-${Date.now()}`;
  const title = `SEO freshness link ${uniqueId}`;
  const url = `https://example.com/${uniqueId}`;
  const homepageUrl = `${configuredOrigin}/`;

  async function getHomepageLastmod() {
    const response = await page.request.get("/sitemap.xml");
    expect(response.ok()).toBe(true);
    return extractLastmodForLoc(await response.text(), homepageUrl);
  }

  try {
    const initialHomeLastmod = await getHomepageLastmod();
    expect(initialHomeLastmod).not.toBeNull();

    await page.goto("/login");
    await page.getByLabel("Username").fill(username);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page).toHaveURL(/\/app$/);
    await page.getByRole("navigation", { name: "Private vault sections" }).getByRole("link", { name: "Links" }).click();
    await expect(page).toHaveURL(/\/app\/links$/);

    await page.getByRole("textbox", { name: /^URL$/ }).fill(url);
    await page.getByRole("textbox", { name: /^Title$/ }).fill(title);
    await page.getByRole("button", { name: "Save link" }).click();

    await expect(page).toHaveURL(/\/app\/links\?saved=1$/);
    const savedLinkEntry = page.locator("article").filter({ has: page.getByRole("link", { name: title }) });
    await expect(savedLinkEntry).toContainText("AI ready", { timeout: 15000 });
    await savedLinkEntry.getByRole("button", { name: "Publish link" }).click();

    await expect(page).toHaveURL(/\/app\/links\?published=1$/);
    let publishedHomeLastmod: string | null = null;
    await expect
      .poll(async () => {
        publishedHomeLastmod = await getHomepageLastmod();
        return publishedHomeLastmod !== null && publishedHomeLastmod !== initialHomeLastmod;
      }, { timeout: 15000 })
      .toBe(true);

    expect(publishedHomeLastmod).not.toBeNull();
    expect(new Date(publishedHomeLastmod!).getTime()).toBeGreaterThan(new Date(initialHomeLastmod!).getTime());

    await savedLinkEntry.getByRole("button", { name: "Unpublish link" }).click();
    await expect(page).toHaveURL(/\/app\/links\?unpublished=1$/);

    let unpublishedHomeLastmod: string | null = null;
    await expect
      .poll(async () => {
        unpublishedHomeLastmod = await getHomepageLastmod();
        return unpublishedHomeLastmod !== null && unpublishedHomeLastmod !== publishedHomeLastmod;
      }, { timeout: 15000 })
      .toBe(true);

    expect(unpublishedHomeLastmod).not.toBe(initialHomeLastmod);
    expect(unpublishedHomeLastmod).not.toBe(publishedHomeLastmod);
    expect(new Date(unpublishedHomeLastmod!).getTime()).toBeGreaterThan(new Date(publishedHomeLastmod!).getTime());
  } finally {
    await prisma.link.deleteMany({
      where: {
        OR: [{ title }, { url }]
      }
    });
    await setAiPlaywrightTestMode("passthrough");
  }
});
