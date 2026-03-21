import "dotenv/config";

import { rm } from "node:fs/promises";
import path from "node:path";
import { tmpdir } from "node:os";

import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";
import { expect, test, type Page } from "@playwright/test";

const desktopViewport = { width: 1440, height: 900 };
const databaseUrl = process.env.DATABASE_URL;
const mediaRoot = path.resolve(process.env.MEDIA_ROOT ?? path.join(tmpdir(), "minakeep-media"));
const pngFixture = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9pY3S7EAAAAASUVORK5CYII=",
  "base64"
);

if (!databaseUrl) {
  throw new Error("DATABASE_URL must be set before running note image upload E2E tests.");
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
    throw new Error(`Owner account '${username}' must exist before note image upload tests run.`);
  }

  return owner;
}

async function resetState() {
  const owner = await getOwner();

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

  return owner;
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

test.beforeEach(async () => {
  await resetState();
});

test.afterAll(async () => {
  await prisma.$disconnect();
});

test("@note-image-upload owners can upload a note image, insert markdown automatically, and keep it in saved note content", async ({
  page
}) => {
  await page.setViewportSize(desktopViewport);
  await signIn(page);
  await page.goto("/app/notes/new");

  await page.getByRole("textbox", { name: "Title" }).fill("Note image upload draft");
  await page.getByTestId("note-image-upload-input").setInputFiles({
    buffer: pngFixture,
    mimeType: "image/png",
    name: "studio-desk.png"
  });

  const editor = page.getByTestId("note-markdown-input");
  const preview = page.getByTestId("note-markdown-preview");

  await expect(page.getByText("Inserted studio-desk.png into the note body.")).toBeVisible();
  await expect(editor).toHaveValue(/!\[studio desk\]\(\/media\/[a-zA-Z0-9-]+\)/);

  const uploadedPreviewImage = preview.getByRole("img", { name: "studio desk" });
  await expect(uploadedPreviewImage).toBeVisible();
  await expect(uploadedPreviewImage).toHaveAttribute("src", /\/media\/[a-zA-Z0-9-]+$/);

  const insertedMarkdown = await editor.inputValue();
  const markdownMatch = insertedMarkdown.match(/!\[studio desk\]\((\/media\/[a-zA-Z0-9-]+)\)/);

  expect(markdownMatch?.[1]).toBeTruthy();

  await page.getByRole("button", { name: "Create draft" }).click();
  await expect(page).toHaveURL(/\/app\/notes\/.+\/edit\?saved=1$/);
  await expect(page.getByText("Draft saved.")).toBeVisible();
  await expect(page.getByTestId("note-markdown-input")).toHaveValue(insertedMarkdown);
  await expect(page.getByTestId("note-markdown-preview").getByRole("img", { name: "studio desk" })).toBeVisible();

  const owner = await getOwner();
  const savedNote = await prisma.note.findFirst({
    where: {
      ownerId: owner.id,
      title: "Note image upload draft"
    },
    include: {
      mediaAssets: {
        select: {
          contentType: true,
          id: true,
          noteId: true
        }
      }
    }
  });

  expect(savedNote).not.toBeNull();
  expect(savedNote?.markdown).toBe(insertedMarkdown);

  const savedAssetId = savedNote?.markdown.match(/!\[studio desk\]\(\/media\/([a-zA-Z0-9-]+)\)/)?.[1];
  const savedAsset = savedNote?.mediaAssets.find((asset) => asset.id === savedAssetId);

  expect(savedAsset?.contentType).toBe("image/png");
  expect(savedAsset?.noteId).toBe(savedNote?.id);
});
