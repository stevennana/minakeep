import "dotenv/config";

import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";
import { expect, test, type Page } from "@playwright/test";

const desktopViewport = { width: 1440, height: 900 };
const mobileViewport = { width: 390, height: 844 };
const databaseUrl = process.env.DATABASE_URL?.startsWith("file:./")
  ? "file:" + process.cwd() + "/" + process.env.DATABASE_URL.slice("file:./".length)
  : process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL must be set before running UI system tests.");
}

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({
    url: databaseUrl
  })
});

function getOwnerCredentials() {
  return {
    username: process.env.OWNER_USERNAME ?? "owner",
    password: process.env.OWNER_PASSWORD ?? "password"
  };
}

async function seedPublicChromeContent() {
  const { username } = getOwnerCredentials();
  const owner = await prisma.user.findUnique({
    where: {
      username
    }
  });

  if (!owner) {
    throw new Error(`Owner account '${username}' must exist before UI system tests run.`);
  }

  await prisma.note.deleteMany({
    where: {
      ownerId: owner.id
    }
  });

  await prisma.link.deleteMany({
    where: {
      ownerId: owner.id
    }
  });

  await prisma.note.create({
    data: {
      ownerId: owner.id,
      title: "Calm public archive",
      slug: "calm-public-archive",
      markdown: "# Calm public archive",
      excerpt: "A small public archive still reads clearly when only explicit note publishing reaches the homepage.",
      summary: "The public chrome should stay calm and note-first when no links have been promoted yet.",
      enrichmentStatus: "ready",
      isPublished: true,
      publishedAt: new Date("2024-06-01T09:00:00.000Z"),
      tags: {
        connectOrCreate: [
          {
            where: {
              name: "public chrome"
            },
            create: {
              name: "public chrome"
            }
          }
        ]
      }
    }
  });
}

async function signIn(page: Page) {
  const { username, password } = getOwnerCredentials();

  await page.goto("/login");
  await page.getByLabel("Username").fill(username);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/app$/);
}

async function expectNoHorizontalOverflow(page: Page) {
  const hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);

  expect(hasOverflow).toBe(false);
}

async function expectAccessibleStructure(page: Page) {
  const audit = await page.evaluate(() => {
    const issues: string[] = [];

    const getLabelText = (element: Element) => {
      const ariaLabel = element.getAttribute("aria-label")?.trim();
      if (ariaLabel) {
        return ariaLabel;
      }

      const labelledBy = element.getAttribute("aria-labelledby");
      if (labelledBy) {
        const text = labelledBy
          .split(/\s+/)
          .map((id) => document.getElementById(id)?.textContent?.trim() ?? "")
          .join(" ")
          .trim();

        if (text) {
          return text;
        }
      }

      if (
        element instanceof HTMLInputElement ||
        element instanceof HTMLTextAreaElement ||
        element instanceof HTMLSelectElement
      ) {
        const label = element.labels?.[0]?.textContent?.trim();

        if (label) {
          return label;
        }
      }

      return element.textContent?.trim() ?? "";
    };

    const interactive = document.querySelectorAll("a[href], button, input:not([type='hidden']), textarea, select");

    interactive.forEach((element) => {
      if (!getLabelText(element)) {
        const id = element.id ? `#${element.id}` : "";
        issues.push(`unnamed:${element.tagName.toLowerCase()}${id}`);
      }
    });

    document.querySelectorAll("nav").forEach((element, index) => {
      if (!element.getAttribute("aria-label")) {
        issues.push(`unlabeled-nav:${index + 1}`);
      }
    });

    return {
      h1Count: document.querySelectorAll("h1").length,
      issues,
      lang: document.documentElement.lang,
      mainCount: document.querySelectorAll("main").length
    };
  });

  expect(audit.lang).toBe("en");
  expect(audit.mainCount).toBe(1);
  expect(audit.h1Count).toBeGreaterThan(0);
  expect(audit.issues).toEqual([]);
}

test.describe.configure({ mode: "serial" });

test.afterAll(async () => {
  await prisma.$disconnect();
});

test("@ui-regression @ui-system @ui-public-taste-foundation @ui-public-taste-regression public chrome holds together on desktop", async ({ page }) => {
  await seedPublicChromeContent();
  await page.setViewportSize(desktopViewport);
  await page.goto("/");

  await expect(page.getByRole("navigation", { name: "Primary" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Published notes" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: "Owner login" })).toBeVisible();
  await expect(page.getByRole("complementary")).toHaveCount(0);
  await expect(page.locator(".note-collection-panel .section-heading").filter({ hasText: "Published notes" })).toBeVisible();
  await expectAccessibleStructure(page);
  await expectNoHorizontalOverflow(page);

  await expect(page.locator(".site-header")).toHaveScreenshot("ui-system-site-header-desktop.png", {
    animations: "disabled"
  });
  await expect(page.locator(".public-hero")).toHaveScreenshot("ui-system-public-hero-desktop.png", {
    animations: "disabled",
    maxDiffPixelRatio: 0.02
  });
});

test("@ui-regression @ui-system login surface stays readable on mobile", async ({ page }) => {
  await page.setViewportSize(mobileViewport);
  await page.goto("/login");

  await expect(page.getByRole("heading", { name: "Sign in to the private vault" })).toBeVisible();
  await expect(page.getByText("Credentials")).toBeVisible();
  await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
  await expectAccessibleStructure(page);
  await expectNoHorizontalOverflow(page);

  await expect(page.locator(".login-layout")).toHaveScreenshot("ui-system-login-mobile.png", {
    animations: "disabled"
  });
});

test("@ui-regression @ui-system @ui-owner-shell @ui-responsive private shell keeps hierarchy on desktop", async ({ page }) => {
  await page.setViewportSize(desktopViewport);
  await signIn(page);

  await expect(page.getByRole("navigation", { name: "Private vault sections" })).toBeVisible();
  await expect(page.locator(".vault-frame-title")).toHaveText("Private vault");
  await expect(page.getByText("Sections")).toBeVisible();
  await expect(page.getByRole("link", { name: "New note" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Dashboard route shortcuts" })).toHaveCount(0);
  await expectAccessibleStructure(page);
  await expectNoHorizontalOverflow(page);

  await expect(page.locator(".vault-frame-header")).toHaveScreenshot("ui-system-vault-header-desktop.png", {
    animations: "disabled"
  });
  await expect(page.locator(".feature-layout > .hero-card")).toHaveScreenshot("ui-system-dashboard-hero-desktop.png", {
    animations: "disabled",
    mask: [page.locator(".feature-layout > .hero-card .summary-row")]
  });
});

test("@ui-regression @ui-system @ui-owner-shell @ui-responsive private shell collapses cleanly on mobile", async ({ page }) => {
  await page.setViewportSize(mobileViewport);
  await signIn(page);

  await expect(page.getByRole("navigation", { name: "Private vault sections" })).toBeVisible();
  await expect(page.locator(".vault-frame-title")).toHaveText("Private vault");
  await expect(page.getByText("Sections")).toBeVisible();
  await expect(page.getByRole("link", { name: "New note" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Sign out" })).toBeVisible();
  await expectAccessibleStructure(page);
  await expectNoHorizontalOverflow(page);

  await expect(page.locator(".vault-frame-header")).toHaveScreenshot("ui-system-vault-header-mobile.png", {
    animations: "disabled"
  });
});
