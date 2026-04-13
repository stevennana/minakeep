import "dotenv/config";

import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { tmpdir } from "node:os";

import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";
import { expect, test, type Locator, type Page } from "@playwright/test";

const desktopViewport = { width: 1440, height: 900 };
const mobileViewport = { width: 390, height: 844 };
const databaseUrl = process.env.DATABASE_URL?.startsWith("file:./")
  ? "file:" + process.cwd() + "/" + process.env.DATABASE_URL.slice("file:./".length)
  : process.env.DATABASE_URL;
const mediaRoot = path.resolve(process.env.MEDIA_ROOT ?? path.join(tmpdir(), "minakeep-media"));

if (!databaseUrl) {
  throw new Error("DATABASE_URL must be set before running rendered markdown image loading UI tests.");
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
    throw new Error(`Owner account '${username}' must exist before rendered markdown image loading UI tests run.`);
  }

  return owner;
}

async function writeMediaFixture(storageKey: string, body: string) {
  const filePath = path.resolve(mediaRoot, storageKey);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, body, "utf8");
}

function buildSvg(label: string, fill: string) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360"><rect width="640" height="360" fill="${fill}"/><text x="28" y="180" font-size="34" fill="#f8fafc">${label}</text></svg>`;
}

async function seedRenderedMarkdownFixtures() {
  const owner = await getOwner();
  const timestamp = Date.now();
  const fixtures = {
    ownerPreviewEarly: {
      alt: "Owner preview first image",
      assetId: `ui-rendered-markdown-owner-early-image-${timestamp}`,
      fill: "#0f766e",
      id: `ui-rendered-markdown-owner-early-note-${timestamp}`,
      markdown: `![Owner preview first image](/media/ui-rendered-markdown-owner-early-image-${timestamp})

The preview should give the first rendered image the eager slot when it lands immediately in the opening pane.`,
      title: "Owner preview prioritized image"
    },
    ownerPreviewLate: {
      alt: "Owner preview later image",
      assetId: `ui-rendered-markdown-owner-late-image-${timestamp}`,
      fill: "#0369a1",
      id: `ui-rendered-markdown-owner-late-note-${timestamp}`,
      markdown: `## Opening context

The preview starts with enough authored setup that the first image should stay on the lazy path.

Another paragraph keeps the reading rhythm text-first before the media arrives lower in the pane.

One more paragraph closes the opening section and leaves the image outside the initial preview viewport on both desktop and mobile.

This extra paragraph is intentionally long so the late image stays below the first screen even on taller desktop previews where the card chrome itself still fits comfortably.

- Text-first preview flow
- No eager upgrade for later article media
- Keep the viewport budget narrow

The preview still includes one more block of text after the list so the late image is clearly outside the opening pane instead of sitting on its bottom edge.

This final paragraph adds enough extra height to keep the first image below the initial preview viewport on tall desktop layouts too, which makes the lazy-loading assertion durable instead of depending on a near-the-fold boundary.

Another deliberate block continues the opening explanation without introducing media, keeping the first rendered image on the lazy path while the operator still sees text-first preview content.

Yet another paragraph keeps the preview anchored on writing rather than media and gives the regression enough vertical room to prove that the late image stays outside the opening viewport.

![Owner preview later image](/media/ui-rendered-markdown-owner-late-image-${timestamp})`,
      title: "Owner preview lazy image"
    },
    publicNoteEarly: {
      alt: "Public note first image",
      assetId: `ui-rendered-markdown-public-early-image-${timestamp}`,
      fill: "#7c3aed",
      id: `ui-rendered-markdown-public-early-note-${timestamp}`,
      markdown: `![Public note first image](/media/ui-rendered-markdown-public-early-image-${timestamp})

The public note should prioritize the first rendered image when it is part of the opening reading viewport.`,
      slug: `ui-rendered-markdown-public-early-${timestamp}`,
      title: "Public note prioritized image"
    },
    publicNoteLate: {
      alt: "Public note later image",
      assetId: `ui-rendered-markdown-public-late-image-${timestamp}`,
      fill: "#b45309",
      id: `ui-rendered-markdown-public-late-note-${timestamp}`,
      markdown: `## Reading comes first

The public page opens with enough written context to keep the browser focused on type before media.

Another paragraph extends the intro so the first article image stays below the opening viewport.

The loading contract should leave later images lazy instead of spending the eager slot on deep article media.

This extra paragraph intentionally stretches the opening reading section so the screenshot and viewport checks cover a clearly below-the-fold article image on desktop as well as mobile.

- Keep the first beat textual
- Do not widen the eager budget
- Let later media stay lazy

One final paragraph keeps the article opening text-led on taller desktops too, which makes the lazy assertion reflect a clearly offscreen first image instead of a borderline placement at the fold.

![Public note later image](/media/ui-rendered-markdown-public-late-image-${timestamp})`,
      slug: `ui-rendered-markdown-public-late-${timestamp}`,
      title: "Public note lazy image"
    }
  } as const;

  await prisma.mediaAsset.deleteMany({
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

  const notes = [fixtures.publicNoteEarly, fixtures.publicNoteLate, fixtures.ownerPreviewEarly, fixtures.ownerPreviewLate];

  for (const note of notes) {
    await prisma.note.create({
      data: {
        id: note.id,
        ownerId: owner.id,
        title: note.title,
        slug: "slug" in note ? note.slug : `${note.id}-slug`,
        markdown: note.markdown,
        excerpt: `${note.title} excerpt`,
        summary: `${note.title} summary`,
        enrichmentStatus: "ready",
        isPublished: "slug" in note,
        publishedAt: "slug" in note ? new Date("2026-04-12T09:00:00.000Z") : null,
        createdAt: new Date("2026-04-12T09:00:00.000Z"),
        updatedAt: new Date("2026-04-12T09:00:00.000Z")
      }
    });
  }

  const mediaAssets = notes.map((note) => ({
    contentType: "image/svg+xml",
    fileName: `${note.id}.svg`,
    fill: note.fill,
    id: note.assetId,
    noteId: note.id,
    ownerId: owner.id,
    sizeBytes: Buffer.byteLength(buildSvg(note.alt, note.fill)),
    storageKey: `note-images/${note.id}/${note.assetId}.svg`,
    svg: buildSvg(note.alt, note.fill)
  }));

  await prisma.mediaAsset.createMany({
    data: mediaAssets.map(({ fill: _fill, svg: _svg, ...asset }) => ({
      ...asset,
      kind: "note-image"
    }))
  });

  await Promise.all(mediaAssets.map((asset) => writeMediaFixture(asset.storageKey, asset.svg)));

  return fixtures;
}

async function signIn(page: Page) {
  const { password, username } = ownerCredentials();

  await page.goto("/login");
  await page.getByLabel("Username").fill(username);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/app$/);
}

async function expectLoadingPriority(image: Locator, intent: "prioritized" | "lazy") {
  if (intent === "prioritized") {
    await expect(image).toHaveAttribute("loading", "eager");
    await expect(image).toHaveAttribute("fetchpriority", "high");
    return;
  }

  await expect(image).toHaveAttribute("loading", "lazy");
  await expect(image).not.toHaveAttribute("fetchpriority", "high");
}

async function expectViewportPlacement(image: Locator, placement: "opening" | "below") {
  const metrics = await image.evaluate((node) => {
    const rect = node.getBoundingClientRect();

    return {
      bottom: Math.round(rect.bottom),
      top: Math.round(rect.top),
      viewportHeight: window.innerHeight
    };
  });

  if (placement === "opening") {
    expect(metrics.top).toBeLessThan(metrics.viewportHeight);
    expect(metrics.bottom).toBeGreaterThan(0);
    return;
  }

  expect(metrics.top).toBeGreaterThanOrEqual(metrics.viewportHeight);
}

async function expectNoHorizontalOverflow(page: Page) {
  const hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);

  expect(hasOverflow).toBe(false);
}

async function openOwnerPreview(page: Page, noteId: string, isMobile: boolean) {
  await page.goto(`/app/notes/${noteId}/edit`);

  if (isMobile) {
    const previewButton = page.getByTestId("note-editor-mode-switcher").getByRole("button", { name: "Preview" });
    await previewButton.click();
    await expect(previewButton).toHaveAttribute("aria-pressed", "true");
  }

  const previewPane = page.getByTestId("note-editor-preview-pane");
  await expect(previewPane).toBeVisible();
  await previewPane.scrollIntoViewIfNeeded();
}

test.describe.configure({ mode: "serial" });

let fixtures: Awaited<ReturnType<typeof seedRenderedMarkdownFixtures>>;

test.beforeEach(async () => {
  fixtures = await seedRenderedMarkdownFixtures();
});

test.afterAll(async () => {
  await prisma.$disconnect();
});

test("@ui-image-loading-regression desktop rendered markdown images only prioritize the opening viewport image", async ({ page }) => {
  await page.setViewportSize(desktopViewport);

  await page.goto(`/notes/${fixtures.publicNoteEarly.slug}`);
  const publicEarlyImage = page.getByTestId("public-note-markdown").getByRole("img", { name: fixtures.publicNoteEarly.alt });
  await expectLoadingPriority(publicEarlyImage, "prioritized");
  await expectViewportPlacement(publicEarlyImage, "opening");
  await expect(page.locator(".public-note-card")).toHaveScreenshot("ui-image-loading-rendered-markdown-public-desktop.png", {
    animations: "disabled"
  });

  await page.goto(`/notes/${fixtures.publicNoteLate.slug}`);
  const publicLateImage = page.getByTestId("public-note-markdown").getByRole("img", { name: fixtures.publicNoteLate.alt });
  await expectLoadingPriority(publicLateImage, "lazy");
  await expectViewportPlacement(publicLateImage, "below");
  await expectNoHorizontalOverflow(page);

  await signIn(page);
  await openOwnerPreview(page, fixtures.ownerPreviewEarly.id, false);
  const ownerPreviewPane = page.getByTestId("note-editor-preview-pane");
  const ownerEarlyImage = page.getByTestId("note-markdown-preview").getByRole("img", { name: fixtures.ownerPreviewEarly.alt });
  await expectLoadingPriority(ownerEarlyImage, "prioritized");
  await expectViewportPlacement(ownerEarlyImage, "opening");
  await expect(ownerPreviewPane).toHaveScreenshot("ui-image-loading-rendered-markdown-owner-desktop.png", {
    animations: "disabled"
  });

  await openOwnerPreview(page, fixtures.ownerPreviewLate.id, false);
  const ownerLateImage = page.getByTestId("note-markdown-preview").getByRole("img", { name: fixtures.ownerPreviewLate.alt });
  await expectLoadingPriority(ownerLateImage, "lazy");
  await expectViewportPlacement(ownerLateImage, "below");
  await expectNoHorizontalOverflow(page);
});

test("@ui-image-loading-regression mobile rendered markdown images only prioritize the opening viewport image", async ({ page }) => {
  await page.setViewportSize(mobileViewport);

  await page.goto(`/notes/${fixtures.publicNoteEarly.slug}`);
  const publicEarlyImage = page.getByTestId("public-note-markdown").getByRole("img", { name: fixtures.publicNoteEarly.alt });
  await expectLoadingPriority(publicEarlyImage, "prioritized");
  await expectViewportPlacement(publicEarlyImage, "opening");
  await expect(page.locator(".public-note-card")).toHaveScreenshot("ui-image-loading-rendered-markdown-public-mobile.png", {
    animations: "disabled"
  });

  await page.goto(`/notes/${fixtures.publicNoteLate.slug}`);
  const publicLateImage = page.getByTestId("public-note-markdown").getByRole("img", { name: fixtures.publicNoteLate.alt });
  await expectLoadingPriority(publicLateImage, "lazy");
  await expectViewportPlacement(publicLateImage, "below");
  await expectNoHorizontalOverflow(page);

  await signIn(page);
  await openOwnerPreview(page, fixtures.ownerPreviewEarly.id, true);
  const ownerPreviewPane = page.getByTestId("note-editor-preview-pane");
  const ownerEarlyImage = page.getByTestId("note-markdown-preview").getByRole("img", { name: fixtures.ownerPreviewEarly.alt });
  await expectLoadingPriority(ownerEarlyImage, "prioritized");
  await expectViewportPlacement(ownerEarlyImage, "opening");
  await expect(ownerPreviewPane).toHaveScreenshot("ui-image-loading-rendered-markdown-owner-mobile.png", {
    animations: "disabled"
  });

  await openOwnerPreview(page, fixtures.ownerPreviewLate.id, true);
  const ownerLateImage = page.getByTestId("note-markdown-preview").getByRole("img", { name: fixtures.ownerPreviewLate.alt });
  await expectLoadingPriority(ownerLateImage, "lazy");
  await expectViewportPlacement(ownerLateImage, "below");
  await expectNoHorizontalOverflow(page);
});
