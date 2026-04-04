import "dotenv/config";

import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";
import { expect, test, type Page } from "@playwright/test";

const desktopViewport = { width: 1440, height: 900 };
const mobileViewport = { width: 390, height: 844 };

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL must be set before running UI public note Mermaid tests.");
}

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({
    url: databaseUrl
  })
});

const seededNote = {
  title: "Published Mermaid diagrams should read like part of the note",
  slug: "published-mermaid-diagrams-should-read-like-part-of-the-note",
  markdown: `## Diagram rhythm should stay in the article

The public note should render a Mermaid block inline without surfacing raw fences or diagram-specific chrome.

\`\`\`mermaid
flowchart LR
  Draft[Draft note] --> Review{Ready to publish?}
  Review -->|yes| Public[Public note page]
  Review -->|no| Revise[Keep editing]
\`\`\`

### Supported non-flowchart diagrams should render semantically

\`\`\`mermaid
sequenceDiagram
  participant Owner as Owner
  participant Public as Public note
  Owner->>Public: Publish note
  Public-->>Owner: Render diagram inline
\`\`\`

### Malformed supported Mermaid still fails softly

\`\`\`mermaid
sequenceDiagram
  participant Owner as Owner
  This is not valid Mermaid source.
\`\`\`

The fallback should stay bounded and readable on narrow screens.`,
  summary: "Published Mermaid diagrams should render inline on public notes, while invalid blocks degrade to a bounded readable fallback.",
  publishedAt: new Date("2024-06-02T09:30:00.000Z"),
  tags: ["mermaid", "public notes", "reading"]
} as const;

async function seedPublishedNote() {
  const username = process.env.OWNER_USERNAME ?? "owner";
  const owner = await prisma.user.findUnique({
    where: {
      username
    }
  });

  if (!owner) {
    throw new Error(`Owner account '${username}' must exist before UI public note Mermaid tests run.`);
  }

  await prisma.note.deleteMany({
    where: {
      ownerId: owner.id
    }
  });

  await prisma.note.create({
    data: {
      ownerId: owner.id,
      title: seededNote.title,
      slug: seededNote.slug,
      markdown: seededNote.markdown,
      excerpt: "Published Mermaid diagrams should render inline and degrade safely on public note pages.",
      summary: seededNote.summary,
      enrichmentStatus: "ready",
      isPublished: true,
      publishedAt: seededNote.publishedAt,
      tags: {
        connectOrCreate: seededNote.tags.map((tag) => ({
          where: {
            name: tag
          },
          create: {
            name: tag
          }
        }))
      }
    }
  });
}

async function expectNoHorizontalOverflow(page: Page) {
  const hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);

  expect(hasOverflow).toBe(false);
}

async function expectMermaidSurface(page: Page, viewport: "desktop" | "mobile") {
  const metrics = await page.evaluate(() => {
    const body = document.querySelector<HTMLElement>("[data-testid='public-note-markdown']");
    const rendered = document.querySelectorAll<HTMLElement>(".markdown-mermaid--rendered");
    const fallback = document.querySelector<HTMLElement>(".markdown-mermaid--fallback");
    const svg = rendered[0]?.querySelector<SVGElement>(".markdown-mermaid-svg");
    const sequenceSvg = rendered[1]?.querySelector<SVGElement>(".markdown-mermaid-svg");
    const fallbackPre = fallback?.querySelector<HTMLElement>("pre");

    if (!body || rendered.length < 2 || !fallback || !svg || !sequenceSvg || !fallbackPre) {
      throw new Error("Expected Mermaid public note anchors to exist.");
    }

    const bodyRect = body.getBoundingClientRect();
    const renderedRect = rendered[0].getBoundingClientRect();
    const renderedSequenceRect = rendered[1].getBoundingClientRect();
    const svgRect = svg.getBoundingClientRect();
    const sequenceSvgRect = sequenceSvg.getBoundingClientRect();
    const fallbackRect = fallback.getBoundingClientRect();
    const fallbackPreRect = fallbackPre.getBoundingClientRect();

    return {
      bodyWidth: Math.round(bodyRect.width),
      fallbackPreWidth: Math.round(fallbackPreRect.width),
      fallbackWidth: Math.round(fallbackRect.width),
      renderedWidth: Math.round(renderedRect.width),
      renderedSequenceWidth: Math.round(renderedSequenceRect.width),
      svgWidth: Math.round(svgRect.width),
      sequenceSvgWidth: Math.round(sequenceSvgRect.width),
      viewportWidth: document.documentElement.clientWidth
    };
  });

  expect(metrics.renderedWidth).toBeLessThanOrEqual(metrics.bodyWidth + 1);
  expect(metrics.renderedSequenceWidth).toBeLessThanOrEqual(metrics.bodyWidth + 1);
  expect(metrics.fallbackWidth).toBeLessThanOrEqual(metrics.bodyWidth + 1);
  expect(metrics.fallbackPreWidth).toBeLessThanOrEqual(metrics.fallbackWidth + 1);
  expect(metrics.svgWidth).toBeGreaterThanOrEqual(viewport === "desktop" ? 440 : metrics.viewportWidth - 80);
  expect(metrics.svgWidth).toBeLessThanOrEqual(metrics.bodyWidth + 1);
  expect(metrics.sequenceSvgWidth).toBeGreaterThanOrEqual(viewport === "desktop" ? 440 : metrics.viewportWidth - 80);
  expect(metrics.sequenceSvgWidth).toBeLessThanOrEqual(metrics.bodyWidth + 1);
}

test.describe.configure({ mode: "serial" });

test.beforeEach(async () => {
  await seedPublishedNote();
});

test.afterAll(async () => {
  await prisma.$disconnect();
});

test("@ui-public-note-mermaid @ui-mermaid-regression published note renders Mermaid diagrams inline on desktop", async ({ page }) => {
  await page.setViewportSize(desktopViewport);
  await page.goto(`/notes/${seededNote.slug}`);

  const noteBody = page.getByTestId("public-note-markdown");
  const renderedDiagrams = noteBody.locator(".markdown-mermaid--rendered");
  const flowchartDiagram = renderedDiagrams.nth(0);
  const sequenceDiagram = renderedDiagrams.nth(1);
  const fallbackDiagram = noteBody.locator(".markdown-mermaid--fallback");

  await expect(page.getByRole("heading", { name: seededNote.title })).toBeVisible();
  await expect(noteBody.getByRole("heading", { name: "Diagram rhythm should stay in the article" })).toBeVisible();
  await expect(noteBody.getByRole("heading", { name: "Supported non-flowchart diagrams should render semantically" })).toBeVisible();
  await expect(flowchartDiagram.locator("svg[aria-label='Rendered Mermaid diagram']")).toBeVisible();
  await expect(sequenceDiagram.locator("svg.markdown-mermaid-svg[aria-label='Rendered Mermaid diagram']")).toBeVisible();
  await expect(renderedDiagrams).toHaveCount(2);
  await expect(fallbackDiagram).toContainText("Diagram preview unavailable");
  await expect(fallbackDiagram).toContainText("sequenceDiagram");
  await expect(fallbackDiagram).toContainText("This is not valid Mermaid source.");
  await expect(noteBody).not.toContainText("```mermaid");
  await expect(noteBody).not.toContainText("flowchart LR");
  await expect(noteBody).not.toContainText("Owner->>Public: Publish note");
  await expect(noteBody.locator("[data-processed='true']")).toHaveCount(0);
  await expectMermaidSurface(page, "desktop");
  await expectNoHorizontalOverflow(page);

  await expect(page.locator(".public-note-card")).toHaveScreenshot("ui-public-note-mermaid-desktop.png", {
    animations: "disabled"
  });
});

test("@ui-public-note-mermaid @ui-mermaid-regression published note keeps Mermaid diagrams bounded on mobile", async ({ page }) => {
  await page.setViewportSize(mobileViewport);
  await page.goto(`/notes/${seededNote.slug}`);

  const noteBody = page.getByTestId("public-note-markdown");
  const renderedDiagrams = noteBody.locator(".markdown-mermaid--rendered");
  const flowchartDiagram = renderedDiagrams.nth(0);
  const sequenceDiagram = renderedDiagrams.nth(1);
  const fallbackDiagram = noteBody.locator(".markdown-mermaid--fallback");

  await expect(page.getByRole("heading", { name: seededNote.title })).toBeVisible();
  await expect(flowchartDiagram.locator("svg[aria-label='Rendered Mermaid diagram']")).toBeVisible();
  await expect(sequenceDiagram.locator("svg.markdown-mermaid-svg[aria-label='Rendered Mermaid diagram']")).toBeVisible();
  await expect(renderedDiagrams).toHaveCount(2);
  await expect(fallbackDiagram).toContainText("Diagram preview unavailable");
  await expect(fallbackDiagram).toContainText("sequenceDiagram");
  await expect(noteBody).not.toContainText("```mermaid");
  await expect(noteBody).not.toContainText("flowchart LR");
  await expect(noteBody).not.toContainText("Owner->>Public: Publish note");
  await expectMermaidSurface(page, "mobile");
  await expectNoHorizontalOverflow(page);

  await expect(page.locator(".public-note-card")).toHaveScreenshot("ui-public-note-mermaid-mobile.png", {
    animations: "disabled"
  });
});
