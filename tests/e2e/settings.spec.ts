import "dotenv/config";

import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";
import { expect, test, type Locator, type Page } from "@playwright/test";

const databaseUrl = process.env.DATABASE_URL?.startsWith("file:./")
  ? "file:" + process.cwd() + "/" + process.env.DATABASE_URL.slice("file:./".length)
  : process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL must be set before running settings tests.");
}

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({
    url: databaseUrl
  })
});

const defaultBranding = {
  title: "Minakeep",
  description: "Private notes and saved references, with selectively public reading."
} as const;

const ownerBranding = {
  title: "Atlas Shelf",
  description: "Private field notes and selected public references."
} as const;

const demoBranding = {
  title: "Inspection Vault",
  description: "A seeded description for read-only settings coverage."
} as const;

type ServerActionDescriptor = {
  action: string;
  hiddenFields: Array<{
    name: string;
    value: string;
  }>;
};

function getOwnerCredentials() {
  return {
    username: process.env.OWNER_USERNAME ?? "owner",
    password: process.env.OWNER_PASSWORD ?? "password"
  };
}

function getDemoCredentials() {
  return {
    username: process.env.DEMO_USERNAME ?? "demo",
    password: process.env.DEMO_PASSWORD ?? "minakeep-demo-password"
  };
}

async function resetSiteSettings() {
  await prisma.siteSettings.deleteMany();
}

async function seedSiteSettings(branding: { title: string; description: string }) {
  await prisma.siteSettings.upsert({
    where: {
      id: "site"
    },
    update: {
      siteTitle: branding.title,
      siteDescription: branding.description
    },
    create: {
      id: "site",
      siteTitle: branding.title,
      siteDescription: branding.description
    }
  });
}

async function signIn(page: Page, credentials: { username: string; password: string }) {
  await page.goto("/login");
  await page.getByLabel("Username").fill(credentials.username);
  await page.getByLabel("Password").fill(credentials.password);
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

async function postServerAction(page: Page, descriptor: ServerActionDescriptor, fields: Array<[string, string]>) {
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
        redirected: response.redirected,
        status: response.status,
        url: response.url
      };
    },
    { descriptor, fields }
  );
}

async function expectSharedBranding(page: Page, branding: { title: string; description: string }) {
  await expect(page.locator(".site-header .brand")).toHaveText(branding.title);
  await expect(page.locator(".site-header .brand-caption")).toHaveText(branding.description);
  await expect(page).toHaveTitle(branding.title);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", branding.description);
}

test.describe.configure({ mode: "serial" });

test.beforeEach(async () => {
  await resetSiteSettings();
});

test.afterEach(async () => {
  await resetSiteSettings();
});

test.afterAll(async () => {
  await prisma.$disconnect();
});

test("@settings owner can save site settings and the branding propagates across the shipped shell", async ({ page }) => {
  await signIn(page, getOwnerCredentials());

  const workspaceNav = page.getByRole("navigation", { name: "Private vault sections" });
  await expect(workspaceNav.getByRole("link", { name: "Settings" })).toBeVisible();
  await workspaceNav.getByRole("link", { name: "Settings" }).click();

  await expect(page).toHaveURL(/\/app\/settings$/);
  await expect(page.getByRole("heading", { name: "Site configuration" })).toBeVisible();
  await expect(page.getByLabel("Site title")).toHaveValue(defaultBranding.title);
  await expect(page.getByLabel("Site description")).toHaveValue(defaultBranding.description);

  await page.getByLabel("Site title").fill(ownerBranding.title);
  await page.getByLabel("Site description").fill(ownerBranding.description);
  await page.getByRole("button", { name: "Save settings" }).click();

  await expect(page).toHaveURL(/\/app\/settings\?saved=1$/);
  await expect(page.getByText("Site settings saved.")).toBeVisible();
  await expect(page.getByLabel("Site title")).toHaveValue(ownerBranding.title);
  await expect(page.getByLabel("Site description")).toHaveValue(ownerBranding.description);
  await expectSharedBranding(page, ownerBranding);

  await page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: "Published notes" }).click();
  await expect(page).toHaveURL(/\/$/);
  await expectSharedBranding(page, ownerBranding);

  const persistedSettings = await prisma.siteSettings.findUniqueOrThrow({
    where: {
      id: "site"
    }
  });

  expect(persistedSettings.siteTitle).toBe(ownerBranding.title);
  expect(persistedSettings.siteDescription).toBe(ownerBranding.description);
});

test("@settings demo users can inspect settings but cannot save them", async ({ page, browser }) => {
  await seedSiteSettings(demoBranding);
  await signIn(page, getDemoCredentials());
  await page.goto("/app/settings");

  await expect(page.getByRole("heading", { name: "Site configuration" })).toBeVisible();
  await expect(page.locator(".secondary-route-hero .eyebrow")).toHaveText("Read-only demo");
  await expect(page.getByText("This route stays visible in the demo workspace, but site-setting changes remain disabled.")).toBeVisible();
  await expect(page.locator("form.secondary-control-panel")).toHaveCount(0);
  await expect(page.locator("div.secondary-control-panel")).toHaveCount(1);
  await expect(page.getByLabel("Site title")).toHaveValue(demoBranding.title);
  await expect(page.getByLabel("Site title")).toBeDisabled();
  await expect(page.getByLabel("Site description")).toHaveValue(demoBranding.description);
  await expect(page.getByLabel("Site description")).toBeDisabled();
  await expect(page.getByRole("button", { name: "Save unavailable" })).toBeDisabled();
  await expectSharedBranding(page, demoBranding);

  const ownerPage = await browser.newPage();
  await signIn(ownerPage, getOwnerCredentials());
  await ownerPage.goto("/app/settings");
  const saveSettingsAction = await captureServerAction(ownerPage.locator("form.secondary-control-panel"));
  await ownerPage.close();

  const blockedSave = await postServerAction(page, saveSettingsAction, [
    ["title", "Tampered demo title"],
    ["description", "Tampered demo description"]
  ]);

  expect(blockedSave.redirected).toBe(true);
  expect(blockedSave.status).toBe(200);
  expect(blockedSave.url).toContain("error=read-only");

  await page.goto("/app/settings?error=read-only");
  await expect(page.getByText("Read-only demo users cannot save workspace settings.")).toBeVisible();
  await expect(page.getByLabel("Site title")).toHaveValue(demoBranding.title);
  await expect(page.getByLabel("Site description")).toHaveValue(demoBranding.description);

  const persistedSettings = await prisma.siteSettings.findUniqueOrThrow({
    where: {
      id: "site"
    }
  });

  expect(persistedSettings.siteTitle).toBe(demoBranding.title);
  expect(persistedSettings.siteDescription).toBe(demoBranding.description);
});
