import "dotenv/config";

import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";
import { expect, test, type Locator, type Page } from "@playwright/test";

import { cleanupOwnerLinkFixtures, cleanupOwnerNoteFixtures } from "./helpers/sqlite-fixtures";

const databaseUrl = process.env.DATABASE_URL?.startsWith("file:./")
  ? "file:" + process.cwd() + "/" + process.env.DATABASE_URL.slice("file:./".length)
  : process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL must be set before running demo-user tests.");
}

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({
    url: databaseUrl
  })
});

const seededDraftNote = {
  enrichmentError: "Seeded note failure to expose the retry control.",
  excerpt: "A seeded owner note that proves the demo user is reading real workspace content.",
  markdown: "# Demo workspace note",
  slug: "demo-workspace-note",
  title: "Demo workspace note",
  updatedAt: new Date("2026-03-27T08:15:00.000Z")
} as const;

const seededPublishedNote = {
  excerpt: "A published note used to verify unpublish requests stay blocked for the demo user.",
  markdown: "# Demo published note",
  slug: "demo-published-note",
  title: "Demo published note",
  updatedAt: new Date("2026-03-27T10:30:00.000Z")
} as const;

const seededDraftLink = {
  summary: "A seeded owner link that stays visible while demo mutation controls remain disabled.",
  title: "Demo workspace link",
  updatedAt: new Date("2026-03-27T09:45:00.000Z"),
  url: "https://example.com/demo-workspace-link"
} as const;

const seededPublishedLink = {
  summary: "A published owner link used to verify demo unpublish requests fail at the server boundary.",
  title: "Demo published link",
  updatedAt: new Date("2026-03-27T11:20:00.000Z"),
  url: "https://example.com/demo-published-link"
} as const;

type SeededWorkspaceFixture = {
  draftLinkId: string;
  draftNoteId: string;
  ownerId: string;
  publishedLinkId: string;
  publishedNoteId: string;
};

type ServerActionDescriptor = {
  action: string;
  hiddenFields: Array<{
    name: string;
    value: string;
  }>;
};

async function seedDemoWorkspaceFixture() {
  const owner = await prisma.user.findUnique({
    where: {
      username: process.env.OWNER_USERNAME ?? "owner"
    }
  });

  if (!owner) {
    throw new Error("The seeded owner account must exist before demo-user tests run.");
  }

  await cleanupOwnerNoteFixtures(prisma, owner.id, [seededDraftNote.slug, seededPublishedNote.slug]);
  await cleanupOwnerLinkFixtures(prisma, owner.id, [seededDraftLink.url, seededPublishedLink.url]);

  const draftNote = await prisma.note.create({
    data: {
      createdAt: seededDraftNote.updatedAt,
      enrichmentAttempts: 1,
      enrichmentError: seededDraftNote.enrichmentError,
      enrichmentStatus: "failed",
      enrichmentUpdatedAt: seededDraftNote.updatedAt,
      excerpt: seededDraftNote.excerpt,
      isPublished: false,
      markdown: seededDraftNote.markdown,
      ownerId: owner.id,
      slug: seededDraftNote.slug,
      title: seededDraftNote.title,
      updatedAt: seededDraftNote.updatedAt
    }
  });

  const publishedNote = await prisma.note.create({
    data: {
      createdAt: seededPublishedNote.updatedAt,
      enrichmentStatus: "ready",
      excerpt: seededPublishedNote.excerpt,
      isPublished: true,
      markdown: seededPublishedNote.markdown,
      ownerId: owner.id,
      publishedAt: seededPublishedNote.updatedAt,
      slug: seededPublishedNote.slug,
      title: seededPublishedNote.title,
      updatedAt: seededPublishedNote.updatedAt
    }
  });

  const draftLink = await prisma.link.create({
    data: {
      createdAt: seededDraftLink.updatedAt,
      enrichmentAttempts: 1,
      enrichmentError: "Seeded link failure to expose the retry control.",
      enrichmentStatus: "failed",
      enrichmentUpdatedAt: seededDraftLink.updatedAt,
      isPublished: false,
      ownerId: owner.id,
      summary: seededDraftLink.summary,
      title: seededDraftLink.title,
      updatedAt: seededDraftLink.updatedAt,
      url: seededDraftLink.url
    }
  });

  const publishedLink = await prisma.link.create({
    data: {
      createdAt: seededPublishedLink.updatedAt,
      enrichmentStatus: "ready",
      isPublished: true,
      ownerId: owner.id,
      publishedAt: seededPublishedLink.updatedAt,
      summary: seededPublishedLink.summary,
      title: seededPublishedLink.title,
      updatedAt: seededPublishedLink.updatedAt,
      url: seededPublishedLink.url
    }
  });

  return {
    draftLinkId: draftLink.id,
    draftNoteId: draftNote.id,
    ownerId: owner.id,
    publishedLinkId: publishedLink.id,
    publishedNoteId: publishedNote.id
  } satisfies SeededWorkspaceFixture;
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

async function signInAsOwner(page: Page) {
  const username = process.env.OWNER_USERNAME ?? "owner";
  const password = process.env.OWNER_PASSWORD ?? "password";

  await page.goto("/login");
  await page.getByLabel("Username").fill(username);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page).toHaveURL(/\/app$/);
}

async function captureServerAction(form: Locator): Promise<ServerActionDescriptor> {
  await expect(form).toHaveCount(1);

  return form.evaluate((node) => {
    if (!(node instanceof HTMLFormElement)) {
      throw new Error("Expected a form element for server action capture.");
    }

    const hiddenFields = Array.from(node.querySelectorAll<HTMLInputElement>("input[type='hidden']")).map((input) => ({
      name: input.name,
      value: input.value
    }));

    return {
      action: node.action || window.location.href,
      hiddenFields
    };
  });
}

async function postServerAction(page: Page, descriptor: ServerActionDescriptor, fields: Array<[string, string]> = []) {
  return page.evaluate(
    async ({ descriptor, fields }) => {
      const body = new FormData();

      for (const field of descriptor.hiddenFields) {
        body.append(field.name, field.value);
      }

      for (const [name, value] of fields) {
        body.append(name, value);
      }

      const response = await fetch(descriptor.action, {
        body,
        method: "POST"
      });

      return {
        location: response.headers.get("location"),
        redirected: response.redirected,
        status: response.status,
        url: response.url,
        text: await response.text()
      };
    },
    { descriptor, fields }
  );
}

test.describe.configure({ mode: "serial" });

let seededFixture: SeededWorkspaceFixture;

test.beforeEach(async () => {
  seededFixture = await seedDemoWorkspaceFixture();
});

test.afterEach(async () => {
  await cleanupOwnerNoteFixtures(prisma, seededFixture.ownerId, [seededDraftNote.slug, seededPublishedNote.slug]);
  await cleanupOwnerLinkFixtures(prisma, seededFixture.ownerId, [seededDraftLink.url, seededPublishedLink.url]);
});

test.afterAll(async () => {
  await prisma.$disconnect();
});

test("@demo-user demo credentials authenticate a runtime demo session and reach the dashboard", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByText("Owner editing access and read-only demo access to notes, links, tags, and search.")).toBeVisible();
  await expect(page.getByText("Workspace access")).toBeVisible();
  await expect(page.getByText("Owner or demo")).toBeVisible();

  const username = await signInAsDemo(page);
  const ownerUsername = process.env.OWNER_USERNAME ?? "owner";
  const primaryNav = page.getByRole("navigation", { name: "Primary" });

  await expect(primaryNav.getByRole("link", { name: "Read-only workspace" })).toBeVisible();
  await expect(page.getByText("You are browsing the owner workspace in read-only mode.")).toBeVisible();
  await expect(page.getByRole("heading", { name: `${ownerUsername}’s notes` })).toBeVisible();
  await expect(page.getByRole("link", { name: seededDraftNote.title })).toBeVisible();
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
  const ownerNoteList = page.getByTestId("owner-dashboard-note-list");
  const draftNoteEditHref = await ownerNoteList.getByRole("link", { name: seededDraftNote.title }).getAttribute("href");
  const publishedNoteEditHref = await ownerNoteList.getByRole("link", { name: seededPublishedNote.title }).getAttribute("href");

  expect(draftNoteEditHref).toBeTruthy();
  expect(publishedNoteEditHref).toBeTruthy();

  await page.goto("/app/links");
  await expect(page.getByRole("heading", { name: "Reference shelf" })).toBeVisible();
  await expect(page.getByLabel("URL")).toBeDisabled();
  await expect(page.getByLabel("Title")).toBeDisabled();
  await expect(page.getByRole("button", { name: "Save link unavailable" })).toBeDisabled();
  await expect(page.getByRole("link", { name: seededDraftLink.title })).toBeVisible();
  const seededLinkCard = page.getByRole("article").filter({ has: page.getByRole("link", { name: seededDraftLink.title }) });
  await expect(seededLinkCard.getByRole("button", { name: "Refresh favicon unavailable" })).toBeDisabled();
  await expect(seededLinkCard.getByRole("button", { name: "Publish unavailable" })).toBeDisabled();
  await expect(seededLinkCard.getByRole("button", { name: "Delete unavailable" })).toBeDisabled();
  await expect(seededLinkCard.getByRole("button", { name: "Retry unavailable" })).toBeDisabled();
  const publishedLinkCard = page
    .getByRole("article")
    .filter({ has: page.getByRole("link", { name: seededPublishedLink.title }) });
  await expect(publishedLinkCard.getByRole("button", { name: "Unpublish unavailable" })).toBeDisabled();
  await expect(publishedLinkCard.getByRole("button", { name: "Delete unavailable" })).toBeDisabled();

  await page.goto("/app/tags");
  await expect(page.getByRole("heading", { name: "Browse one private taxonomy" })).toBeVisible();
  await expect(page.getByRole("link", { name: seededDraftNote.title })).toBeVisible();
  await expect(page.getByRole("link", { name: seededDraftLink.title })).toBeVisible();

  await page.goto(`/app/search?q=${encodeURIComponent("Demo workspace")}`);
  await expect(page.getByRole("heading", { name: "Search the private vault" })).toBeVisible();
  await expect(page.getByLabel("Query")).toHaveValue("Demo workspace");
  await expect(page.getByRole("link", { name: seededDraftNote.title })).toBeVisible();
  await expect(page.getByRole("link", { name: seededDraftLink.title })).toBeVisible();

  await page.goto(draftNoteEditHref!);
  await expect(page.getByRole("heading", { name: "Edit draft note" })).toBeVisible();
  await expect(page.getByLabel("Title")).toHaveValue(seededDraftNote.title);
  await expect(page.getByLabel("Title")).toHaveJSProperty("readOnly", true);
  await expect(page.getByLabel("Markdown body")).toHaveValue(seededDraftNote.markdown);
  await expect(page.getByLabel("Markdown body")).toHaveJSProperty("readOnly", true);
  await expect(page.getByRole("button", { name: "Save unavailable" })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Publish unavailable" })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Delete unavailable" })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Retry unavailable" })).toBeDisabled();

  await page.goto("/app/notes/new");
  await expect(page.getByRole("heading", { name: "New draft note" })).toBeVisible();
  await expect(page.getByRole("textbox", { name: /^Title$/ })).toHaveValue("");
  await expect(page.getByRole("textbox", { name: /^Title$/ })).toHaveJSProperty("readOnly", true);
  await expect(page.getByLabel("Markdown body")).toHaveValue("");
  await expect(page.getByLabel("Markdown body")).toHaveJSProperty("readOnly", true);
  await expect(page.getByRole("button", { name: "Save unavailable" })).toBeDisabled();

  await page.goto(publishedNoteEditHref!);
  await expect(page.getByRole("heading", { name: "Edit draft note" })).toBeVisible();
  await expect(page.getByLabel("Title")).toHaveValue(seededPublishedNote.title);
  await expect(page.getByLabel("Title")).toHaveJSProperty("readOnly", true);
  await expect(page.getByLabel("Markdown body")).toHaveValue(seededPublishedNote.markdown);
  await expect(page.getByLabel("Markdown body")).toHaveJSProperty("readOnly", true);
  await expect(page.getByRole("button", { name: "Save unavailable" })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Unpublish unavailable" })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Delete unavailable" })).toBeDisabled();
});

test("@demo-user direct demo mutation attempts are rejected at the server boundary", async ({ browser }) => {
  const ownerPage = await browser.newPage();
  await signInAsOwner(ownerPage);

  await ownerPage.goto("/app/notes/new");
  const createNoteAction = await captureServerAction(ownerPage.locator("form.note-form"));

  await ownerPage.goto(`/app/notes/${seededFixture.draftNoteId}/edit`);
  const updateNoteAction = await captureServerAction(ownerPage.locator("form.note-form"));
  const publishNoteAction = await captureServerAction(ownerPage.locator("form").filter({ has: ownerPage.getByRole("button", { name: "Publish note" }) }));
  const deleteNoteAction = await captureServerAction(ownerPage.locator("details.delete-disclosure form"));
  const retryNoteAction = await captureServerAction(ownerPage.locator("form").filter({ has: ownerPage.getByRole("button", { name: "Retry AI enrichment" }) }));

  await ownerPage.goto(`/app/notes/${seededFixture.publishedNoteId}/edit`);
  const unpublishNoteAction = await captureServerAction(ownerPage.locator("form").filter({ has: ownerPage.getByRole("button", { name: "Unpublish note" }) }));

  await ownerPage.goto("/app/links");
  const createLinkAction = await captureServerAction(ownerPage.locator("form.link-form"));
  const draftLinkCard = ownerPage.getByRole("article").filter({ has: ownerPage.getByRole("link", { name: seededDraftLink.title }) });
  const refreshLinkFaviconAction = await captureServerAction(draftLinkCard.locator("form.secondary-link-favicon-refresh"));
  const publishLinkAction = await captureServerAction(draftLinkCard.locator("form").filter({ has: ownerPage.getByRole("button", { name: "Publish link" }) }));
  const deleteLinkAction = await captureServerAction(draftLinkCard.locator("details.delete-disclosure form"));
  const retryLinkAction = await captureServerAction(draftLinkCard.locator("form.secondary-link-retry"));
  const publishedLinkCard = ownerPage.getByRole("article").filter({ has: ownerPage.getByRole("link", { name: seededPublishedLink.title }) });
  const unpublishLinkAction = await captureServerAction(publishedLinkCard.locator("form").filter({ has: ownerPage.getByRole("button", { name: "Unpublish link" }) }));
  await ownerPage.close();

  const demoPage = await browser.newPage();
  await signInAsDemo(demoPage);

  const createNoteResult = await postServerAction(demoPage, createNoteAction, [
    ["title", "Demo blocked note create"],
    ["markdown", "# blocked create"]
  ]);
  expect(createNoteResult.redirected).toBe(true);
  expect(createNoteResult.status).toBe(200);
  expect(createNoteResult.url).toContain("error=read-only");

  const updateNoteResult = await postServerAction(demoPage, updateNoteAction, [
    ["title", "Tampered demo title"],
    ["markdown", "# tampered demo markdown"]
  ]);
  expect(updateNoteResult.redirected).toBe(true);
  expect(updateNoteResult.status).toBe(200);
  expect(updateNoteResult.url).toContain("error=read-only");

  const publishNoteResult = await postServerAction(demoPage, publishNoteAction);
  expect(publishNoteResult.redirected).toBe(true);
  expect(publishNoteResult.status).toBe(200);
  expect(publishNoteResult.url).toContain("error=read-only");

  const deleteNoteResult = await postServerAction(demoPage, deleteNoteAction);
  expect(deleteNoteResult.redirected).toBe(true);
  expect(deleteNoteResult.status).toBe(200);
  expect(deleteNoteResult.url).toContain("error=read-only");

  const unpublishNoteResult = await postServerAction(demoPage, unpublishNoteAction);
  expect(unpublishNoteResult.redirected).toBe(true);
  expect(unpublishNoteResult.status).toBe(200);
  expect(unpublishNoteResult.url).toContain("error=read-only");

  const retryNoteResult = await postServerAction(demoPage, retryNoteAction);
  expect(retryNoteResult.redirected).toBe(true);
  expect(retryNoteResult.status).toBe(200);
  expect(retryNoteResult.url).toContain("error=read-only");

  const createLinkResult = await postServerAction(demoPage, createLinkAction, [
    ["url", "https://example.com/demo-blocked-link"],
    ["title", "Demo blocked link create"]
  ]);
  expect(createLinkResult.redirected).toBe(true);
  expect(createLinkResult.status).toBe(200);
  expect(createLinkResult.url).toContain("error=read-only");

  const publishLinkResult = await postServerAction(demoPage, publishLinkAction);
  expect(publishLinkResult.redirected).toBe(true);
  expect(publishLinkResult.status).toBe(200);
  expect(publishLinkResult.url).toContain("error=read-only");

  const deleteLinkResult = await postServerAction(demoPage, deleteLinkAction);
  expect(deleteLinkResult.redirected).toBe(true);
  expect(deleteLinkResult.status).toBe(200);
  expect(deleteLinkResult.url).toContain("error=read-only");

  const unpublishLinkResult = await postServerAction(demoPage, unpublishLinkAction);
  expect(unpublishLinkResult.redirected).toBe(true);
  expect(unpublishLinkResult.status).toBe(200);
  expect(unpublishLinkResult.url).toContain("error=read-only");

  const retryLinkResult = await postServerAction(demoPage, retryLinkAction);
  expect(retryLinkResult.redirected).toBe(true);
  expect(retryLinkResult.status).toBe(200);
  expect(retryLinkResult.url).toContain("error=read-only");

  const refreshLinkFaviconResult = await postServerAction(demoPage, refreshLinkFaviconAction);
  expect(refreshLinkFaviconResult.redirected).toBe(true);
  expect(refreshLinkFaviconResult.status).toBe(200);
  expect(refreshLinkFaviconResult.url).toContain("error=read-only");

  const uploadResult = await demoPage.evaluate(async ({ noteId }) => {
    const formData = new FormData();
    formData.append("noteId", noteId);
    formData.append("file", new File(["blocked"], "blocked.png", { type: "image/png" }));

    const response = await fetch("/api/notes/images", {
      body: formData,
      method: "POST"
    });

    return {
      payload: (await response.json()) as {
        error?: string;
      },
      status: response.status
    };
  }, { noteId: seededFixture.draftNoteId });
  expect(uploadResult.status).toBe(403);
  expect(uploadResult.payload.error).toBe("Read-only demo users cannot upload note images.");

  const ownerCheckPage = await browser.newPage();
  await signInAsOwner(ownerCheckPage);

  await ownerCheckPage.goto("/app");
  await expect(ownerCheckPage.getByRole("link", { name: seededDraftNote.title })).toBeVisible();
  await expect(ownerCheckPage.getByRole("link", { name: seededPublishedNote.title })).toBeVisible();
  await expect(ownerCheckPage.getByRole("link", { name: "Demo blocked note create" })).toHaveCount(0);

  await ownerCheckPage.goto(`/app/notes/${seededFixture.draftNoteId}/edit`);
  await expect(ownerCheckPage.getByLabel("Title")).toHaveValue(seededDraftNote.title);
  await expect(ownerCheckPage.getByLabel("Markdown body")).toHaveValue(seededDraftNote.markdown);
  await expect(ownerCheckPage.getByRole("button", { name: "Publish note" })).toBeVisible();

  await ownerCheckPage.goto(`/app/notes/${seededFixture.publishedNoteId}/edit`);
  await expect(ownerCheckPage.getByLabel("Title")).toHaveValue(seededPublishedNote.title);
  await expect(ownerCheckPage.getByRole("button", { name: "Unpublish note" })).toBeVisible();

  await ownerCheckPage.goto("/app/links");
  await expect(ownerCheckPage.getByRole("link", { name: seededDraftLink.title })).toBeVisible();
  await expect(ownerCheckPage.getByRole("link", { name: seededPublishedLink.title })).toBeVisible();
  await expect(ownerCheckPage.getByRole("link", { name: "Demo blocked link create" })).toHaveCount(0);

  await ownerCheckPage.close();

  await demoPage.close();
});
