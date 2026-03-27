import "dotenv/config";

import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";
import { expect, test, type Locator, type Page } from "@playwright/test";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL must be set before running delete tests.");
}

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({
    url: databaseUrl
  })
});

type DeleteFixture = {
  link: {
    id: string;
    title: string;
    url: string;
  };
  note: {
    id: string;
    slug: string;
    title: string;
  };
  ownerId: string;
};

type ServerActionDescriptor = {
  action: string;
  hiddenFields: Array<{
    name: string;
    value: string;
  }>;
};

function getOwnerCredentials() {
  return {
    password: process.env.OWNER_PASSWORD ?? "password",
    username: process.env.OWNER_USERNAME ?? "owner"
  };
}

function getDemoCredentials() {
  return {
    password: process.env.DEMO_PASSWORD ?? "minakeep-demo-password",
    username: process.env.DEMO_USERNAME ?? "demo"
  };
}

async function getOwnerRecord() {
  const owner = await prisma.user.findUnique({
    where: {
      username: getOwnerCredentials().username
    }
  });

  if (!owner) {
    throw new Error("The seeded owner account must exist before delete tests run.");
  }

  return owner;
}

async function seedDeleteFixture(label: string): Promise<DeleteFixture> {
  const owner = await getOwnerRecord();
  const uniqueId = `${label}-${Date.now()}`;
  const noteTitle = `Delete note ${uniqueId}`;
  const noteSlug = `delete-note-${uniqueId}`;
  const linkTitle = `Delete link ${uniqueId}`;
  const linkUrl = `https://example.com/delete-link-${uniqueId}`;
  const updatedAt = new Date("2026-03-27T05:00:00.000Z");

  await prisma.note.deleteMany({
    where: {
      ownerId: owner.id,
      slug: noteSlug
    }
  });

  await prisma.link.deleteMany({
    where: {
      ownerId: owner.id,
      url: linkUrl
    }
  });

  const note = await prisma.note.create({
    data: {
      createdAt: updatedAt,
      enrichmentAttempts: 1,
      enrichmentStatus: "ready",
      enrichmentUpdatedAt: updatedAt,
      excerpt: `An unpublished note fixture for ${uniqueId}.`,
      isPublished: false,
      markdown: `# ${noteTitle}\n\nPermanent delete should remove this draft.`,
      ownerId: owner.id,
      slug: noteSlug,
      title: noteTitle,
      updatedAt
    }
  });

  const link = await prisma.link.create({
    data: {
      createdAt: updatedAt,
      enrichmentAttempts: 1,
      enrichmentStatus: "ready",
      enrichmentUpdatedAt: updatedAt,
      isPublished: false,
      ownerId: owner.id,
      summary: `An unpublished link fixture for ${uniqueId}.`,
      title: linkTitle,
      updatedAt,
      url: linkUrl
    }
  });

  return {
    link: {
      id: link.id,
      title: link.title,
      url: link.url
    },
    note: {
      id: note.id,
      slug: note.slug,
      title: note.title
    },
    ownerId: owner.id
  };
}

async function cleanupDeleteFixtures() {
  const owner = await getOwnerRecord();

  await prisma.link.deleteMany({
    where: {
      ownerId: owner.id,
      url: {
        startsWith: "https://example.com/delete-link-"
      }
    }
  });

  await prisma.note.deleteMany({
    where: {
      ownerId: owner.id,
      slug: {
        startsWith: "delete-note-"
      }
    }
  });
}

async function signIn(page: Page, credentials: { username: string; password: string }) {
  await page.goto("/login");
  await page.getByLabel("Username").fill(credentials.username);
  await page.getByLabel("Password").fill(credentials.password);
  await page.getByRole("button", { name: "Sign in" }).click();
}

async function signInAsOwner(page: Page) {
  await signIn(page, getOwnerCredentials());
  await expect(page).toHaveURL(/\/app$/);
}

async function signInAsDemo(page: Page) {
  await signIn(page, getDemoCredentials());
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

async function postServerAction(page: Page, descriptor: ServerActionDescriptor) {
  return page.evaluate(async ({ descriptor }) => {
    const body = new FormData();

    for (const field of descriptor.hiddenFields) {
      body.append(field.name, field.value);
    }

    const response = await fetch(descriptor.action, {
      body,
      method: "POST"
    });

    return {
      redirected: response.redirected,
      status: response.status,
      url: response.url
    };
  }, { descriptor });
}

test.describe.configure({ mode: "serial" });

test.beforeEach(async () => {
  await cleanupDeleteFixtures();
});

test.afterEach(async () => {
  await cleanupDeleteFixtures();
});

test("owner can permanently delete an unpublished note after explicit confirmation", async ({ page }) => {
  const fixture = await seedDeleteFixture("note");

  await signInAsOwner(page);
  await page.goto(`/app/notes/${fixture.note.id}/edit`);

  const deleteDisclosure = page.locator("details.delete-disclosure");
  await deleteDisclosure.locator("summary").click();
  await expect(deleteDisclosure.getByText("This permanently removes this unpublished note.")).toBeVisible();
  await deleteDisclosure.getByRole("button", { name: "Delete permanently" }).click();

  await expect(page).toHaveURL(/\/app\?deleted=note$/);
  await expect(page.getByText("Note permanently deleted.")).toBeVisible();
  await expect(page.getByRole("link", { name: fixture.note.title })).toHaveCount(0);
  await expect(page.getByText("Delete note")).toHaveCount(0);

  expect(
    await prisma.note.findUnique({
      where: {
        id: fixture.note.id
      }
    })
  ).toBeNull();
});

test("owner can permanently delete an unpublished link after explicit confirmation", async ({ page }) => {
  const fixture = await seedDeleteFixture("link");

  await signInAsOwner(page);
  await page.goto("/app/links");

  const linkCard = page.getByRole("article").filter({ has: page.getByRole("link", { name: fixture.link.title }) });
  const deleteDisclosure = linkCard.locator("details.delete-disclosure");
  await deleteDisclosure.locator("summary").click();
  await expect(deleteDisclosure.getByText("This permanently removes this unpublished link.")).toBeVisible();
  await deleteDisclosure.getByRole("button", { name: "Delete permanently" }).click();

  await expect(page).toHaveURL(/\/app\/links\?deleted=1$/);
  await expect(page.getByText("Link permanently deleted.")).toBeVisible();
  await expect(page.getByRole("link", { name: fixture.link.title })).toHaveCount(0);

  expect(
    await prisma.link.findUnique({
      where: {
        id: fixture.link.id
      }
    })
  ).toBeNull();
});

test("published items stay undeletable until they are unpublished first", async ({ page }) => {
  const fixture = await seedDeleteFixture("published-guard");

  await signInAsOwner(page);

  await page.goto(`/app/notes/${fixture.note.id}/edit`);
  const noteDeleteAction = await captureServerAction(page.locator("details.delete-disclosure form"));
  await page.getByRole("button", { name: "Publish note" }).click();
  await expect(page).toHaveURL(/\/app\/notes\/.+\/edit\?published=1$/);
  await expect(page.getByRole("button", { name: "Unpublish before deleting" })).toBeDisabled();

  const noteDeleteResult = await postServerAction(page, noteDeleteAction);
  expect(noteDeleteResult.redirected).toBe(true);
  expect(noteDeleteResult.status).toBe(200);
  expect(noteDeleteResult.url).toContain("error=delete-published");

  const publishedNote = await prisma.note.findUniqueOrThrow({
    where: {
      id: fixture.note.id
    }
  });
  expect(publishedNote.isPublished).toBe(true);

  await page.goto("/app/links");
  const draftLinkCard = page.getByRole("article").filter({ has: page.getByRole("link", { name: fixture.link.title }) });
  const linkDeleteAction = await captureServerAction(draftLinkCard.locator("details.delete-disclosure form"));
  await draftLinkCard.getByRole("button", { name: "Publish link" }).click();
  await expect(page).toHaveURL(/\/app\/links\?published=1$/);

  const publishedLinkCard = page.getByRole("article").filter({ has: page.getByRole("link", { name: fixture.link.title }) });
  await expect(publishedLinkCard.getByRole("button", { name: "Delete unavailable until unpublished" })).toBeDisabled();

  const linkDeleteResult = await postServerAction(page, linkDeleteAction);
  expect(linkDeleteResult.redirected).toBe(true);
  expect(linkDeleteResult.status).toBe(200);
  expect(linkDeleteResult.url).toContain("error=delete-published");

  const publishedLink = await prisma.link.findUniqueOrThrow({
    where: {
      id: fixture.link.id
    }
  });
  expect(publishedLink.isPublished).toBe(true);
});

test("demo users cannot delete notes or links", async ({ browser }) => {
  const fixture = await seedDeleteFixture("demo-guard");

  const ownerPage = await browser.newPage();
  await signInAsOwner(ownerPage);

  await ownerPage.goto(`/app/notes/${fixture.note.id}/edit`);
  const noteDeleteAction = await captureServerAction(ownerPage.locator("details.delete-disclosure form"));

  await ownerPage.goto("/app/links");
  const linkCard = ownerPage.getByRole("article").filter({ has: ownerPage.getByRole("link", { name: fixture.link.title }) });
  const linkDeleteAction = await captureServerAction(linkCard.locator("details.delete-disclosure form"));
  await ownerPage.close();

  const demoPage = await browser.newPage();
  await signInAsDemo(demoPage);

  const noteDeleteResult = await postServerAction(demoPage, noteDeleteAction);
  expect(noteDeleteResult.redirected).toBe(true);
  expect(noteDeleteResult.status).toBe(200);
  expect(noteDeleteResult.url).toContain("error=read-only");

  const linkDeleteResult = await postServerAction(demoPage, linkDeleteAction);
  expect(linkDeleteResult.redirected).toBe(true);
  expect(linkDeleteResult.status).toBe(200);
  expect(linkDeleteResult.url).toContain("error=read-only");

  expect(
    await prisma.note.findUnique({
      where: {
        id: fixture.note.id
      }
    })
  ).not.toBeNull();
  expect(
    await prisma.link.findUnique({
      where: {
        id: fixture.link.id
      }
    })
  ).not.toBeNull();

  await demoPage.close();
});
