import "dotenv/config";

import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { tmpdir } from "node:os";

import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";
import { expect, test, type Page } from "@playwright/test";

import { getMediaAssetPath } from "../../src/features/media/types";

const databaseUrl = process.env.DATABASE_URL?.startsWith("file:./")
  ? "file:" + process.cwd() + "/" + process.env.DATABASE_URL.slice("file:./".length)
  : process.env.DATABASE_URL;
const mediaRoot = path.resolve(process.env.MEDIA_ROOT ?? path.join(tmpdir(), "minakeep-media"));

if (!databaseUrl) {
  throw new Error("DATABASE_URL must be set before running media foundation E2E tests.");
}

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({
    url: databaseUrl
  })
});

async function getOwner() {
  const username = process.env.OWNER_USERNAME ?? "owner";
  const owner = await prisma.user.findUnique({
    where: {
      username
    }
  });

  if (!owner) {
    throw new Error(`Owner account '${username}' must exist before media foundation tests run.`);
  }

  return owner;
}

async function resetMediaState() {
  const owner = await getOwner();

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

  await rm(mediaRoot, { recursive: true, force: true });
  await mkdir(mediaRoot, { recursive: true });

  return owner;
}

async function writeMediaFixture(storageKey: string, body: string) {
  const filePath = path.resolve(mediaRoot, storageKey);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, body, "utf8");
}

async function signIn(page: Page) {
  const username = process.env.OWNER_USERNAME ?? "owner";
  const password = process.env.OWNER_PASSWORD ?? "password";

  await page.goto("/login");
  await page.getByLabel("Username").fill(username);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/app$/);
}

async function seedDraftNoteImage() {
  const owner = await resetMediaState();
  const noteId = `draft-note-${Date.now()}`;
  const assetId = `draft-note-image-${Date.now()}`;
  const storageKey = `note-images/${noteId}/${assetId}.svg`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="#1f2937"/><text x="4" y="20" font-size="8" fill="#f8fafc">draft</text></svg>`;

  await prisma.note.create({
    data: {
      id: noteId,
      ownerId: owner.id,
      title: "Draft note media boundary",
      slug: "draft-note-media-boundary",
      markdown: `![Draft image](${getMediaAssetPath(assetId)})`,
      excerpt: "Draft note media boundary",
      enrichmentStatus: "ready",
      isPublished: false
    }
  });

  await prisma.mediaAsset.create({
    data: {
      id: assetId,
      ownerId: owner.id,
      kind: "note-image",
      storageKey,
      fileName: "draft-note.svg",
      contentType: "image/svg+xml",
      sizeBytes: Buffer.byteLength(svg),
      noteId
    }
  });

  await writeMediaFixture(storageKey, svg);

  return {
    assetId,
    svg
  };
}

async function seedPublishedMedia() {
  const owner = await resetMediaState();
  const publishedNoteId = `published-note-${Date.now()}`;
  const publishedAssetId = `published-note-image-${Date.now()}`;
  const hiddenAssetId = `hidden-note-image-${Date.now()}`;
  const linkId = `published-link-${Date.now()}`;
  const faviconAssetId = `published-link-favicon-${Date.now()}`;
  const publishedStorageKey = `note-images/${publishedNoteId}/${publishedAssetId}.svg`;
  const hiddenStorageKey = `note-images/${publishedNoteId}/${hiddenAssetId}.svg`;
  const faviconStorageKey = `favicons/${linkId}/${faviconAssetId}.svg`;
  const noteSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="#0f766e"/><text x="2" y="20" font-size="8" fill="#ecfeff">public</text></svg>`;
  const hiddenSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="#7c2d12"/><text x="3" y="20" font-size="8" fill="#ffedd5">hidden</text></svg>`;
  const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><circle cx="16" cy="16" r="14" fill="#1d4ed8"/><text x="9" y="20" font-size="9" fill="#eff6ff">mk</text></svg>`;

  await prisma.note.create({
    data: {
      id: publishedNoteId,
      ownerId: owner.id,
      title: "Published note media boundary",
      slug: "published-note-media-boundary",
      markdown: `![Published image](${getMediaAssetPath(publishedAssetId)})`,
      excerpt: "Published note media boundary",
      enrichmentStatus: "ready",
      isPublished: true,
      publishedAt: new Date("2026-03-21T09:00:00.000Z")
    }
  });

  await prisma.link.create({
    data: {
      id: linkId,
      ownerId: owner.id,
      url: "https://example.com/published-link-media-boundary",
      title: "Published link media boundary",
      summary: "Link favicon should be served from Minakeep once published.",
      enrichmentStatus: "ready",
      isPublished: true,
      publishedAt: new Date("2026-03-21T09:15:00.000Z")
    }
  });

  await prisma.mediaAsset.createMany({
    data: [
      {
        id: publishedAssetId,
        ownerId: owner.id,
        kind: "note-image",
        storageKey: publishedStorageKey,
        fileName: "published-note.svg",
        contentType: "image/svg+xml",
        sizeBytes: Buffer.byteLength(noteSvg),
        noteId: publishedNoteId
      },
      {
        id: hiddenAssetId,
        ownerId: owner.id,
        kind: "note-image",
        storageKey: hiddenStorageKey,
        fileName: "hidden-note.svg",
        contentType: "image/svg+xml",
        sizeBytes: Buffer.byteLength(hiddenSvg),
        noteId: publishedNoteId
      },
      {
        id: faviconAssetId,
        ownerId: owner.id,
        kind: "link-favicon",
        storageKey: faviconStorageKey,
        fileName: "favicon.svg",
        contentType: "image/svg+xml",
        sizeBytes: Buffer.byteLength(faviconSvg),
        linkId
      }
    ]
  });

  await Promise.all([
    writeMediaFixture(publishedStorageKey, noteSvg),
    writeMediaFixture(hiddenStorageKey, hiddenSvg),
    writeMediaFixture(faviconStorageKey, faviconSvg)
  ]);

  return {
    faviconAssetId,
    faviconSvg,
    hiddenAssetId,
    publishedAssetId,
    noteSvg
  };
}

test.describe.configure({ mode: "serial" });

test.afterAll(async () => {
  await prisma.$disconnect();
});

// Hardening contract: draft note uploads must stay dark to anonymous readers even though
// the owner can resolve the same `/media/:assetId` URL through the authenticated route.
test("@media-regression @media-foundation draft note images stay private while the owner can still resolve them through the server-backed route", async ({
  page
}) => {
  const { assetId, svg } = await seedDraftNoteImage();

  const publicResponse = await page.goto(getMediaAssetPath(assetId));
  expect(publicResponse?.status()).toBe(404);
  await expect(page.getByText("Not found")).toBeVisible();

  await signIn(page);

  const ownerResponse = await page.goto(getMediaAssetPath(assetId));
  expect(ownerResponse?.status()).toBe(200);
  expect(ownerResponse?.headers()["content-type"]).toContain("image/svg+xml");
  expect(ownerResponse?.headers()["cache-control"]).toBe("private, no-store");
  expect(await ownerResponse?.text()).toBe(svg);
});

// Hardening contract: public media must remain scoped to published note references and
// published links only, so stray note-image assets do not turn public accidentally.
test("@media-regression @media-foundation published note images and published-link favicons are publicly resolvable, but unreferenced note images stay dark", async ({
  page
}) => {
  const { faviconAssetId, faviconSvg, hiddenAssetId, noteSvg, publishedAssetId } = await seedPublishedMedia();

  const publishedNoteImageResponse = await page.goto(getMediaAssetPath(publishedAssetId));
  expect(publishedNoteImageResponse?.status()).toBe(200);
  expect(publishedNoteImageResponse?.headers()["cache-control"]).toBe("public, max-age=60");
  expect(await publishedNoteImageResponse?.text()).toBe(noteSvg);

  const hiddenNoteImageResponse = await page.goto(getMediaAssetPath(hiddenAssetId));
  expect(hiddenNoteImageResponse?.status()).toBe(404);

  const faviconResponse = await page.goto(getMediaAssetPath(faviconAssetId));
  expect(faviconResponse?.status()).toBe(200);
  expect(faviconResponse?.headers()["content-type"]).toContain("image/svg+xml");
  expect(await faviconResponse?.text()).toBe(faviconSvg);
});
