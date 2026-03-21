import "dotenv/config";

import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { tmpdir } from "node:os";

import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";
import { expect, test, type Page } from "@playwright/test";

import { getMediaAssetPath } from "../../src/features/media/types";

const databaseUrl = process.env.DATABASE_URL;
const mediaRoot = path.resolve(process.env.MEDIA_ROOT ?? path.join(tmpdir(), "minakeep-media"));

if (!databaseUrl) {
  throw new Error("DATABASE_URL must be set before running note image UI tests.");
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
    throw new Error(`Owner account '${username}' must exist before note image UI tests run.`);
  }

  return owner;
}

async function writeMediaFixture(storageKey: string, body: string) {
  const filePath = path.resolve(mediaRoot, storageKey);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, body, "utf8");
}

async function seedNoteImageFixtures() {
  const owner = await getOwner();
  const timestamp = Date.now();
  const publishedNoteId = `ui-note-images-published-${timestamp}`;
  const draftNoteId = `ui-note-images-draft-${timestamp}`;
  const publishedFirstAssetId = `ui-note-images-published-first-${timestamp}`;
  const publishedSecondAssetId = `ui-note-images-published-second-${timestamp}`;
  const draftAssetId = `ui-note-images-draft-${timestamp}`;

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

  const publishedFirstStorageKey = `note-images/${publishedNoteId}/${publishedFirstAssetId}.svg`;
  const publishedSecondStorageKey = `note-images/${publishedNoteId}/${publishedSecondAssetId}.svg`;
  const draftStorageKey = `note-images/${draftNoteId}/${draftAssetId}.svg`;
  const publishedFirstSvg =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 72"><rect width="128" height="72" fill="#0f766e"/><text x="12" y="40" font-size="14" fill="#ecfeff">first</text></svg>';
  const publishedSecondSvg =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 72"><rect width="128" height="72" fill="#1d4ed8"/><text x="12" y="40" font-size="14" fill="#eff6ff">second</text></svg>';
  const draftSvg =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 72"><rect width="128" height="72" fill="#7c2d12"/><text x="12" y="40" font-size="14" fill="#ffedd5">draft</text></svg>';

  await prisma.note.createMany({
    data: [
      {
        id: publishedNoteId,
        ownerId: owner.id,
        title: "Published note image card",
        slug: "published-note-image-card",
        markdown: [
          `![First published card image](${getMediaAssetPath(publishedFirstAssetId)})`,
          "",
          "The showroom should pick the first embedded image for the card.",
          "",
          `![Second published detail image](${getMediaAssetPath(publishedSecondAssetId)})`
        ].join("\n"),
        excerpt: "The first embedded markdown image should become the published note card image.",
        summary: "Published note cards and note pages should reuse referenced note images without bypassing publish boundaries.",
        enrichmentStatus: "ready",
        isPublished: true,
        publishedAt: new Date("2026-03-21T10:00:00.000Z")
      },
      {
        id: draftNoteId,
        ownerId: owner.id,
        title: "Draft note image card",
        slug: "draft-note-image-card",
        markdown: `![Draft owner image](${getMediaAssetPath(draftAssetId)})\n\nDraft note images should stay private.`,
        excerpt: "Draft note images should stay visible to the owner and dark on public routes.",
        enrichmentStatus: "ready",
        isPublished: false
      }
    ]
  });

  await prisma.mediaAsset.createMany({
    data: [
      {
        id: publishedFirstAssetId,
        ownerId: owner.id,
        kind: "note-image",
        storageKey: publishedFirstStorageKey,
        fileName: "published-first.svg",
        contentType: "image/svg+xml",
        sizeBytes: Buffer.byteLength(publishedFirstSvg),
        noteId: publishedNoteId
      },
      {
        id: publishedSecondAssetId,
        ownerId: owner.id,
        kind: "note-image",
        storageKey: publishedSecondStorageKey,
        fileName: "published-second.svg",
        contentType: "image/svg+xml",
        sizeBytes: Buffer.byteLength(publishedSecondSvg),
        noteId: publishedNoteId
      },
      {
        id: draftAssetId,
        ownerId: owner.id,
        kind: "note-image",
        storageKey: draftStorageKey,
        fileName: "draft.svg",
        contentType: "image/svg+xml",
        sizeBytes: Buffer.byteLength(draftSvg),
        noteId: draftNoteId
      }
    ]
  });

  await Promise.all([
    writeMediaFixture(publishedFirstStorageKey, publishedFirstSvg),
    writeMediaFixture(publishedSecondStorageKey, publishedSecondSvg),
    writeMediaFixture(draftStorageKey, draftSvg)
  ]);

  return {
    draftAssetId,
    draftNoteTitle: "Draft note image card",
    publishedFirstAssetId,
    publishedNoteSlug: "published-note-image-card",
    publishedNoteTitle: "Published note image card"
  };
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

test.describe.configure({ mode: "serial" });

test.afterAll(async () => {
  await prisma.$disconnect();
});

test("@ui-note-images owner note cards use the first embedded image and published note images stay behind the publish boundary", async ({
  page
}) => {
  const fixtures = await seedNoteImageFixtures();

  const draftMediaResponse = await page.goto(getMediaAssetPath(fixtures.draftAssetId));
  expect(draftMediaResponse?.status()).toBe(404);

  await signIn(page);

  const ownerDashboard = page.getByTestId("owner-dashboard-note-list");
  const publishedOwnerCard = ownerDashboard.locator("article").filter({ has: page.getByRole("link", { name: fixtures.publishedNoteTitle }) });
  const draftOwnerCard = ownerDashboard.locator("article").filter({ has: page.getByRole("link", { name: fixtures.draftNoteTitle }) });

  await expect(publishedOwnerCard.getByRole("img", { name: "First published card image" })).toHaveAttribute(
    "src",
    getMediaAssetPath(fixtures.publishedFirstAssetId)
  );
  await expect(draftOwnerCard.getByRole("img", { name: "Draft owner image" })).toHaveCount(1);

  await page.goto("/");

  const publicShowroom = page.getByTestId("public-home-showroom");
  const publishedPublicCard = publicShowroom.locator("article").filter({ has: page.getByRole("link", { name: fixtures.publishedNoteTitle }) });

  await expect(publishedPublicCard.getByRole("img", { name: "First published card image" })).toHaveAttribute(
    "src",
    getMediaAssetPath(fixtures.publishedFirstAssetId)
  );
  await expect(publicShowroom.getByRole("link", { name: fixtures.draftNoteTitle })).toHaveCount(0);

  await page.goto(`/notes/${fixtures.publishedNoteSlug}`);

  const publicNoteBody = page.getByTestId("public-note-markdown");
  await expect(publicNoteBody.getByRole("img", { name: "First published card image" })).toHaveAttribute(
    "src",
    getMediaAssetPath(fixtures.publishedFirstAssetId)
  );
  await expect(publicNoteBody.getByRole("img", { name: "Second published detail image" })).toHaveCount(1);
});
