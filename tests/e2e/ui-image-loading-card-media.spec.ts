import "dotenv/config";

import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { tmpdir } from "node:os";

import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";
import { expect, test, type Locator, type Page } from "@playwright/test";

import { getMediaAssetPath } from "../../src/features/media/types";

const desktopViewport = { width: 1440, height: 900 };
const mobileViewport = { width: 390, height: 844 };
const databaseUrl = process.env.DATABASE_URL?.startsWith("file:./")
  ? "file:" + process.cwd() + "/" + process.env.DATABASE_URL.slice("file:./".length)
  : process.env.DATABASE_URL;
const mediaRoot = path.resolve(process.env.MEDIA_ROOT ?? path.join(tmpdir(), "minakeep-media"));

if (!databaseUrl) {
  throw new Error("DATABASE_URL must be set before running card media loading UI tests.");
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

async function getOwner() {
  const { username } = ownerCredentials();
  const owner = await prisma.user.findUnique({
    where: {
      username
    }
  });

  if (!owner) {
    throw new Error(`Owner account '${username}' must exist before card media loading UI tests run.`);
  }

  return owner;
}

async function writeMediaFixture(storageKey: string, body: string) {
  const filePath = path.resolve(mediaRoot, storageKey);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, body, "utf8");
}

function buildSvg(label: string, fill: string, textFill: string) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 72"><rect width="128" height="72" fill="${fill}"/><text x="12" y="40" font-size="14" fill="${textFill}">${label}</text></svg>`;
}

async function seedCardMediaPriorityFixtures() {
  const owner = await getOwner();
  const timestamp = Date.now();

  await prisma.mediaAsset.deleteMany({
    where: {
      ownerId: owner.id
    }
  });

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

  await rm(mediaRoot, { force: true, recursive: true });
  await mkdir(mediaRoot, { recursive: true });

  const publicNotes = [
    {
      id: `ui-card-media-public-note-1-${timestamp}`,
      assetId: `ui-card-media-public-note-image-1-${timestamp}`,
      assetLabel: "Public priority note image one",
      fill: "#0f766e",
      publishedAt: new Date("2026-04-12T09:00:00.000Z"),
      slug: "public-priority-note-one",
      title: "Public priority note one"
    },
    {
      id: `ui-card-media-public-note-2-${timestamp}`,
      assetId: `ui-card-media-public-note-image-2-${timestamp}`,
      assetLabel: "Public priority note image two",
      fill: "#9333ea",
      publishedAt: new Date("2026-04-12T08:58:00.000Z"),
      slug: "public-priority-note-two",
      title: "Public priority note two"
    }
  ] as const;
  const ownerNotes = [
    {
      id: `ui-card-media-owner-note-1-${timestamp}`,
      assetId: `ui-card-media-owner-note-image-1-${timestamp}`,
      assetLabel: "Owner priority note image one",
      fill: "#1d4ed8",
      title: "Owner priority note one",
      updatedAt: new Date("2026-04-12T10:00:00.000Z")
    },
    {
      id: `ui-card-media-owner-note-2-${timestamp}`,
      assetId: `ui-card-media-owner-note-image-2-${timestamp}`,
      assetLabel: "Owner priority note image two",
      fill: "#b45309",
      title: "Owner priority note two",
      updatedAt: new Date("2026-04-12T09:58:00.000Z")
    }
  ] as const;
  const publicLinks = [
    {
      assetId: `ui-card-media-public-link-favicon-1-${timestamp}`,
      fill: "#111827",
      id: `ui-card-media-public-link-1-${timestamp}`,
      publishedAt: new Date("2026-04-12T08:59:00.000Z"),
      title: "Public priority link one",
      url: "https://example.com/public-priority-link-one"
    },
    {
      assetId: `ui-card-media-public-link-favicon-2-${timestamp}`,
      fill: "#374151",
      id: `ui-card-media-public-link-2-${timestamp}`,
      publishedAt: new Date("2026-04-12T08:57:00.000Z"),
      title: "Public priority link two",
      url: "https://example.com/public-priority-link-two"
    }
  ] as const;
  const ownerLinks = [
    {
      assetId: `ui-card-media-owner-link-favicon-1-${timestamp}`,
      fill: "#0f172a",
      id: `ui-card-media-owner-link-1-${timestamp}`,
      title: "Owner priority link one",
      updatedAt: new Date("2026-04-12T10:01:00.000Z"),
      url: "https://example.com/owner-priority-link-one"
    },
    {
      assetId: `ui-card-media-owner-link-favicon-2-${timestamp}`,
      fill: "#1f2937",
      id: `ui-card-media-owner-link-2-${timestamp}`,
      title: "Owner priority link two",
      updatedAt: new Date("2026-04-12T09:59:00.000Z"),
      url: "https://example.com/owner-priority-link-two"
    }
  ] as const;

  for (const note of publicNotes) {
    await prisma.note.create({
      data: {
        id: note.id,
        ownerId: owner.id,
        title: note.title,
        slug: note.slug,
        markdown: [`![${note.assetLabel}](${getMediaAssetPath(note.assetId)})`, "", `# ${note.title}`].join("\n"),
        excerpt: `${note.title} excerpt`,
        summary: `${note.title} summary`,
        enrichmentStatus: "ready",
        isPublished: true,
        publishedAt: note.publishedAt,
        createdAt: note.publishedAt,
        updatedAt: note.publishedAt
      }
    });
  }

  for (const note of ownerNotes) {
    await prisma.note.create({
      data: {
        id: note.id,
        ownerId: owner.id,
        title: note.title,
        slug: `${note.id}-slug`,
        markdown: [`![${note.assetLabel}](${getMediaAssetPath(note.assetId)})`, "", `# ${note.title}`].join("\n"),
        excerpt: `${note.title} excerpt`,
        summary: `${note.title} summary`,
        enrichmentStatus: "ready",
        isPublished: false,
        createdAt: note.updatedAt,
        updatedAt: note.updatedAt
      }
    });
  }

  for (const link of publicLinks) {
    await prisma.link.create({
      data: {
        id: link.id,
        ownerId: owner.id,
        title: link.title,
        url: link.url,
        summary: `${link.title} summary`,
        enrichmentStatus: "ready",
        isPublished: true,
        publishedAt: link.publishedAt,
        createdAt: link.publishedAt,
        updatedAt: link.publishedAt
      }
    });
  }

  for (const link of ownerLinks) {
    await prisma.link.create({
      data: {
        id: link.id,
        ownerId: owner.id,
        title: link.title,
        url: link.url,
        summary: `${link.title} summary`,
        enrichmentStatus: "ready",
        isPublished: false,
        createdAt: link.updatedAt,
        updatedAt: link.updatedAt
      }
    });
  }

  const mediaAssets = [
    ...publicNotes.map((note) => ({
      contentType: "image/svg+xml",
      fileName: `${note.id}.svg`,
      id: note.assetId,
      kind: "note-image" as const,
      noteId: note.id,
      ownerId: owner.id,
      sizeBytes: Buffer.byteLength(buildSvg("public", note.fill, "#ecfeff")),
      storageKey: `note-images/${note.id}/${note.assetId}.svg`,
      svg: buildSvg("public", note.fill, "#ecfeff")
    })),
    ...ownerNotes.map((note) => ({
      contentType: "image/svg+xml",
      fileName: `${note.id}.svg`,
      id: note.assetId,
      kind: "note-image" as const,
      noteId: note.id,
      ownerId: owner.id,
      sizeBytes: Buffer.byteLength(buildSvg("owner", note.fill, "#eff6ff")),
      storageKey: `note-images/${note.id}/${note.assetId}.svg`,
      svg: buildSvg("owner", note.fill, "#eff6ff")
    })),
    ...publicLinks.map((link) => ({
      contentType: "image/svg+xml",
      fileName: `${link.id}.svg`,
      id: link.assetId,
      kind: "link-favicon" as const,
      linkId: link.id,
      ownerId: owner.id,
      sizeBytes: Buffer.byteLength(buildSvg("link", link.fill, "#f9fafb")),
      storageKey: `favicons/${link.id}/${link.assetId}.svg`,
      svg: buildSvg("link", link.fill, "#f9fafb")
    })),
    ...ownerLinks.map((link) => ({
      contentType: "image/svg+xml",
      fileName: `${link.id}.svg`,
      id: link.assetId,
      kind: "link-favicon" as const,
      linkId: link.id,
      ownerId: owner.id,
      sizeBytes: Buffer.byteLength(buildSvg("vault", link.fill, "#f9fafb")),
      storageKey: `favicons/${link.id}/${link.assetId}.svg`,
      svg: buildSvg("vault", link.fill, "#f9fafb")
    }))
  ];

  await prisma.mediaAsset.createMany({
    data: mediaAssets.map(({ svg: _svg, ...asset }) => asset)
  });

  await Promise.all(mediaAssets.map((asset) => writeMediaFixture(asset.storageKey, asset.svg)));

  return {
    ownerLinks,
    ownerNotes,
    publicLinks,
    publicNotes
  };
}

async function signIn(page: Page) {
  const { password, username } = ownerCredentials();

  await page.goto("/login");
  await page.getByLabel("Username").fill(username);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/app$/);
}

async function expectLoadingPriority(locator: Locator, intent: "prioritized" | "lazy") {
  const image = locator.locator("img");

  if (intent === "prioritized") {
    await expect(image).toHaveAttribute("loading", "eager");
    await expect(image).toHaveAttribute("fetchpriority", "high");
    return;
  }

  await expect(image).toHaveAttribute("loading", "lazy");
  await expect(image).not.toHaveAttribute("fetchpriority", "high");
}

async function expectNoHorizontalOverflow(page: Page) {
  const hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);

  expect(hasOverflow).toBe(false);
}

async function expectPublicShowroomLoadingPolicy(page: Page, fixtures: Awaited<ReturnType<typeof seedCardMediaPriorityFixtures>>) {
  await page.goto("/");

  const showroom = page.getByTestId("public-home-showroom");
  const firstNoteCard = showroom.locator("article").filter({ has: page.getByRole("link", { name: fixtures.publicNotes[0].title }) });
  const firstLinkCard = showroom.locator("article").filter({ has: page.getByRole("link", { name: fixtures.publicLinks[0].title }) });
  const secondNoteCard = showroom.locator("article").filter({ has: page.getByRole("link", { name: fixtures.publicNotes[1].title }) });
  const secondLinkCard = showroom.locator("article").filter({ has: page.getByRole("link", { name: fixtures.publicLinks[1].title }) });

  await expectLoadingPriority(firstNoteCard.getByTestId("public-note-card-image"), "prioritized");
  await expectLoadingPriority(firstLinkCard.getByTestId("public-link-card-favicon"), "prioritized");
  await expectLoadingPriority(secondNoteCard.getByTestId("public-note-card-image"), "lazy");
  await expectLoadingPriority(secondLinkCard.getByTestId("public-link-card-favicon"), "lazy");

  await expect(firstNoteCard.getByTestId("public-note-card-media-link")).toHaveAttribute("href", `/notes/${fixtures.publicNotes[0].slug}`);
  await expect(firstLinkCard.getByTestId("public-link-card-media-link")).toHaveAttribute("href", fixtures.publicLinks[0].url);
  await expect(firstLinkCard.getByTestId("public-link-card-media-link")).toHaveAttribute("target", "_blank");
  await expect(firstLinkCard.getByTestId("public-link-card-media-link")).toHaveAttribute("rel", "noopener noreferrer");
  await expectNoHorizontalOverflow(page);
}

async function expectOwnerDashboardLoadingPolicy(page: Page, fixtures: Awaited<ReturnType<typeof seedCardMediaPriorityFixtures>>) {
  const noteList = page.getByTestId("owner-dashboard-note-list");
  const firstNoteCard = noteList.locator("article").filter({ has: page.getByRole("link", { name: fixtures.ownerNotes[0].title }) });
  const secondNoteCard = noteList.locator("article").filter({ has: page.getByRole("link", { name: fixtures.ownerNotes[1].title }) });

  await expectLoadingPriority(firstNoteCard.getByTestId("owner-note-card-image"), "prioritized");
  await expectLoadingPriority(secondNoteCard.getByTestId("owner-note-card-image"), "lazy");
  await expectNoHorizontalOverflow(page);
}

async function expectOwnerLinksLoadingPolicy(page: Page, fixtures: Awaited<ReturnType<typeof seedCardMediaPriorityFixtures>>) {
  await page.getByRole("navigation", { name: "Private vault sections" }).getByRole("link", { name: "Links" }).click();
  await expect(page).toHaveURL(/\/app\/links$/);

  const linkList = page.locator(".link-list");
  const firstLinkCard = linkList.locator("article").filter({ has: page.getByRole("link", { name: fixtures.ownerLinks[0].title }) });
  const secondLinkCard = linkList.locator("article").filter({ has: page.getByRole("link", { name: fixtures.ownerLinks[1].title }) });

  await expectLoadingPriority(firstLinkCard.getByTestId("owner-link-favicon"), "prioritized");
  await expectLoadingPriority(secondLinkCard.getByTestId("owner-link-favicon"), "lazy");
  await expect(firstLinkCard.getByRole("link", { name: fixtures.ownerLinks[0].title })).toHaveAttribute("href", fixtures.ownerLinks[0].url);
  await expect(firstLinkCard.getByRole("link", { name: fixtures.ownerLinks[0].title })).toHaveAttribute("target", "_blank");
  await expectNoHorizontalOverflow(page);
}

test.describe.configure({ mode: "serial" });

let fixtures: Awaited<ReturnType<typeof seedCardMediaPriorityFixtures>>;

test.beforeEach(async () => {
  fixtures = await seedCardMediaPriorityFixtures();
});

test.afterAll(async () => {
  await prisma.$disconnect();
});

test("@ui-image-loading-card-media @ui-image-loading-regression desktop first-screen card media priority stays scoped to the visible budget", async ({
  page
}) => {
  await page.setViewportSize(desktopViewport);

  await expectPublicShowroomLoadingPolicy(page, fixtures);
  await expect(page.locator(".public-home-archive")).toHaveScreenshot("ui-image-loading-card-media-public-desktop.png", {
    animations: "disabled"
  });

  await signIn(page);
  await expectOwnerDashboardLoadingPolicy(page, fixtures);
  await expect(page.locator(".owner-dashboard-main")).toHaveScreenshot("ui-image-loading-card-media-owner-dashboard-desktop.png", {
    animations: "disabled"
  });

  await expectOwnerLinksLoadingPolicy(page, fixtures);
  await expect(page.locator(".secondary-link-panel")).toHaveScreenshot("ui-image-loading-card-media-owner-links-desktop.png", {
    animations: "disabled"
  });
});

test("@ui-image-loading-card-media @ui-image-loading-regression mobile first-screen card media priority stays scoped to the visible budget", async ({
  page
}) => {
  await page.setViewportSize(mobileViewport);

  await expectPublicShowroomLoadingPolicy(page, fixtures);
  await expect(page.locator(".public-home-archive")).toHaveScreenshot("ui-image-loading-card-media-public-mobile.png", {
    animations: "disabled"
  });

  await signIn(page);
  await expectOwnerDashboardLoadingPolicy(page, fixtures);
  await expect(page.locator(".owner-dashboard-main")).toHaveScreenshot("ui-image-loading-card-media-owner-dashboard-mobile.png", {
    animations: "disabled"
  });

  await expectOwnerLinksLoadingPolicy(page, fixtures);
  await expect(page.locator(".secondary-link-panel")).toHaveScreenshot("ui-image-loading-card-media-owner-links-mobile.png", {
    animations: "disabled"
  });
});
