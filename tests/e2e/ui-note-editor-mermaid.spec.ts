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
  throw new Error("DATABASE_URL must be set before running note editor Mermaid UI tests.");
}

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({
    url: databaseUrl
  })
});

const seededNote = {
  title: "Editor Mermaid preview should stay source-first",
  slug: "editor-mermaid-preview-should-stay-source-first",
  markdown: `## Workbench preview should match the public renderer

The editor preview should render Mermaid from the same markdown source without rewriting the authored fence.

\`\`\`mermaid
flowchart LR
  subgraph Studio[Owner studio]
    Draft[Draft note] --> Review{Ready to publish?}
  end
  Review -->|yes| Public[Public note page]
  Review -->|no| Revise[Keep editing]
  classDef muted fill:#e2e8f0,stroke:#64748b,color:#0f172a
  classDef accent fill:#dbeafe,stroke:#2563eb,color:#0f172a,stroke-width:2px
  class Draft,Revise muted
  class Public accent
  style Review fill:#fef3c7,stroke:#d97706,stroke-width:2px,color:#7c2d12
  linkStyle 1 stroke:#2563eb,stroke-width:3px,color:#1d4ed8
\`\`\`

### Class and state diagrams should share the preview path

\`\`\`mermaid
sequenceDiagram
  participant Owner as Owner preview
  participant Public as Public note
  Owner->>Public: shared markdown
  Public-->>Owner: same renderer
\`\`\`

\`\`\`mermaid
classDiagram
  class OwnerNote {
    +String title
    +publish()
  }
  class PublicNotePage {
    +render()
  }
  OwnerNote --> PublicNotePage : ships to
\`\`\`

\`\`\`mermaid
stateDiagram-v2
  [*] --> Draft
  Draft --> Review: save
  Review --> Published: publish
  Published --> [*]
\`\`\`

### Invalid Mermaid should fail softly

\`\`\`mermaid
classDiagram
  class OwnerNote {
    +String title
  }
  This is not valid Mermaid source.
\`\`\`

The author should still be able to inspect the fallback, keep saving, and publish later.`,
  excerpt: "Editor preview should render Mermaid diagrams and bounded fallbacks without mutating the markdown source.",
  summary: "Workbench preview should use the shared Mermaid rendering path while preserving raw markdown fences as the saved source.",
  enrichmentStatus: "ready",
  enrichmentError: null,
  enrichmentAttempts: 1,
  enrichmentUpdatedAt: new Date("2024-06-03T09:30:00.000Z"),
  isPublished: false,
  publishedAt: null,
  updatedAt: new Date("2024-06-03T09:35:00.000Z"),
  tags: ["editor", "mermaid", "preview"]
} as const;

function getOwnerCredentials() {
  return {
    password: process.env.OWNER_PASSWORD ?? "password",
    username: process.env.OWNER_USERNAME ?? "owner"
  };
}

async function seedEditableNote() {
  const { username } = getOwnerCredentials();
  const owner = await prisma.user.findUnique({
    where: {
      username
    }
  });

  if (!owner) {
    throw new Error(`Owner account '${username}' must exist before note editor Mermaid UI tests run.`);
  }

  await prisma.note.deleteMany({
    where: {
      ownerId: owner.id
    }
  });

  const note = await prisma.note.create({
    data: {
      createdAt: seededNote.updatedAt,
      enrichmentAttempts: seededNote.enrichmentAttempts,
      enrichmentError: seededNote.enrichmentError,
      enrichmentStatus: seededNote.enrichmentStatus,
      enrichmentUpdatedAt: seededNote.enrichmentUpdatedAt,
      excerpt: seededNote.excerpt,
      isPublished: seededNote.isPublished,
      markdown: seededNote.markdown,
      ownerId: owner.id,
      publishedAt: seededNote.publishedAt,
      slug: seededNote.slug,
      summary: seededNote.summary,
      tags: {
        connectOrCreate: seededNote.tags.map((tag) => ({
          create: {
            name: tag
          },
          where: {
            name: tag
          }
        }))
      },
      title: seededNote.title,
      updatedAt: seededNote.updatedAt
    }
  });

  return note.id;
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

async function expectMermaidPreviewSurface(page: Page) {
  const metrics = await page.evaluate(() => {
    const preview = document.querySelector<HTMLElement>("[data-testid='note-markdown-preview']");
    const diagrams = document.querySelectorAll<HTMLElement>("[data-testid='note-markdown-preview'] .markdown-mermaid--rendered");
    const fallback = document.querySelector<HTMLElement>("[data-testid='note-markdown-preview'] .markdown-mermaid--fallback");
    const firstDiagram = diagrams[0];
    const diagramShell = firstDiagram?.querySelector<HTMLElement>(".markdown-mermaid-shell");
    const sequenceSvg = diagrams[1]?.querySelector<SVGElement>(".markdown-mermaid-svg");
    const fallbackPre = fallback?.querySelector<HTMLElement>("pre");

    if (!preview || diagrams.length < 4 || !firstDiagram || !diagramShell || !sequenceSvg || !fallback || !fallbackPre) {
      throw new Error("Expected Mermaid editor preview anchors to exist.");
    }

    const previewRect = preview.getBoundingClientRect();
    const diagramWidths = Array.from(diagrams, (diagram) => Math.round(diagram.getBoundingClientRect().width));
    const diagramShellRect = diagramShell.getBoundingClientRect();
    const fallbackRect = fallback.getBoundingClientRect();
    const fallbackPreRect = fallbackPre.getBoundingClientRect();

    return {
      diagramShellWidth: Math.round(diagramShellRect.width),
      diagramWidths,
      fallbackPreWidth: Math.round(fallbackPreRect.width),
      fallbackWidth: Math.round(fallbackRect.width),
      previewWidth: Math.round(previewRect.width),
      sequenceText: sequenceSvg.textContent ?? "",
      viewportWidth: document.documentElement.clientWidth
    };
  });

  for (const diagramWidth of metrics.diagramWidths) {
    expect(diagramWidth).toBeLessThanOrEqual(metrics.previewWidth + 1);
    expect(diagramWidth).toBeGreaterThanOrEqual(220);
  }

  expect(metrics.diagramShellWidth).toBeLessThanOrEqual(metrics.previewWidth + 1);
  expect(metrics.fallbackWidth).toBeLessThanOrEqual(metrics.previewWidth + 1);
  expect(metrics.fallbackPreWidth).toBeLessThanOrEqual(metrics.fallbackWidth + 1);
  expect(metrics.diagramShellWidth).toBeGreaterThanOrEqual(Math.max(220, metrics.previewWidth - 40));
  expect(metrics.sequenceText).toContain("Owner preview");
  expect(metrics.sequenceText).toContain("Public note");

  const styledSignals = await page.evaluate(() => {
    const flowchartSvg = document.querySelector<SVGElement>("[data-testid='note-markdown-preview'] .markdown-mermaid--rendered .markdown-mermaid-svg");

    if (!flowchartSvg) {
      throw new Error("Expected rendered flowchart SVG to exist in the note preview.");
    }

    const svgMarkup = flowchartSvg.outerHTML;
    return {
      hasAccentClass: svgMarkup.includes("accent"),
      hasCluster: svgMarkup.includes("cluster"),
      hasLinkStyle: svgMarkup.includes("#2563eb") || svgMarkup.includes("#1d4ed8"),
      hasMutedClass: svgMarkup.includes("muted"),
      hasReviewStyle: svgMarkup.includes("#fef3c7") && svgMarkup.includes("#d97706")
    };
  });

  expect(styledSignals.hasCluster).toBe(true);
  expect(styledSignals.hasMutedClass).toBe(true);
  expect(styledSignals.hasAccentClass).toBe(true);
  expect(styledSignals.hasReviewStyle).toBe(true);
  expect(styledSignals.hasLinkStyle).toBe(true);
}

async function expectMermaidPreviewContent(page: Page) {
  const editor = page.getByTestId("note-markdown-input");
  const preview = page.getByTestId("note-markdown-preview");
  const sharedDiagram = preview.locator(".markdown-mermaid").first();
  const renderedDiagrams = preview.locator(".markdown-mermaid--rendered");

  await expect(editor).toHaveValue(seededNote.markdown);
  await expect(editor).toHaveValue(/```mermaid/);
  await expect(sharedDiagram).toBeVisible();
  await expect(renderedDiagrams).toHaveCount(4, { timeout: 15000 });
  await expect(sharedDiagram).toHaveAttribute("data-mermaid-source", /flowchart%20LR/);
  await expect(page.getByTestId("note-editor-mermaid-status")).toContainText("Mermaid syntax");
  await expect(preview.locator(".markdown-mermaid--fallback")).toBeHidden();
  await expect(preview).not.toContainText("sequenceDiagram");
  await expect(preview).not.toContainText("participant Owner as Owner preview");
  await expect(preview).not.toContainText("OwnerNote --> PublicNotePage : ships to");
  await expect(preview).not.toContainText("Draft --> Review: save");
  await expect(preview).not.toContainText("```mermaid");
  await expect(preview).not.toContainText("This is not valid Mermaid source.");
  await expect(preview.locator("[data-processed='true']")).toHaveCount(0);
}

test.describe.configure({ mode: "serial" });

let seededNoteId = "";

test.beforeEach(async () => {
  seededNoteId = await seedEditableNote();
});

test.afterAll(async () => {
  await prisma.$disconnect();
});

test("@ui-note-editor-mermaid @ui-mermaid-regression desktop split and preview-only modes render Mermaid through the shared preview path", async ({ page }) => {
  await page.setViewportSize(desktopViewport);
  await signIn(page);
  await page.goto(`/app/notes/${seededNoteId}/edit`);

  const modeSwitcher = page.getByTestId("note-editor-mode-switcher");
  const splitButton = modeSwitcher.getByRole("button", { name: "Split" });
  const previewButton = modeSwitcher.getByRole("button", { name: "Preview" });
  const sourcePane = page.getByTestId("note-editor-source-pane");
  const previewPane = page.getByTestId("note-editor-preview-pane");

  await expect(page.getByRole("heading", { name: "Edit draft note" })).toBeVisible();
  await expect(splitButton).toHaveAttribute("aria-pressed", "true");
  await expect(sourcePane).toBeVisible();
  await expect(previewPane).toBeVisible();
  await expectMermaidPreviewContent(page);
  await expectMermaidPreviewSurface(page);

  await previewButton.click();
  await expect(previewButton).toHaveAttribute("aria-pressed", "true");
  await expect(sourcePane).toBeHidden();
  await expect(previewPane).toBeVisible();
  await expectMermaidPreviewContent(page);

  await page.getByRole("button", { name: "Save draft" }).click();
  await expect(page).toHaveURL(/\/app\/notes\/[^/]+\/edit\?saved=1$/);
  await expect(page.getByText("Draft saved.")).toBeVisible();
  await expect(page.getByTestId("note-markdown-input")).toHaveValue(seededNote.markdown);
  await expectMermaidPreviewContent(page);
  await expectNoHorizontalOverflow(page);

  const savedNote = await prisma.note.findUnique({
    where: {
      id: seededNoteId
    }
  });

  expect(savedNote?.markdown).toBe(seededNote.markdown);

  await expect(page.locator(".note-editor-shell")).toHaveScreenshot("ui-note-editor-mermaid-desktop.png", {
    animations: "disabled",
    maxDiffPixels: 1000
  });
});

test("@ui-note-editor-mermaid @ui-mermaid-regression mobile preview keeps Mermaid diagrams and fallbacks bounded without rewriting markdown", async ({ page }) => {
  await page.setViewportSize(mobileViewport);
  await signIn(page);
  await page.goto(`/app/notes/${seededNoteId}/edit`);

  const modeSwitcher = page.getByTestId("note-editor-mode-switcher");
  const editButton = modeSwitcher.getByRole("button", { name: "Edit" });
  const previewButton = modeSwitcher.getByRole("button", { name: "Preview" });
  const sourcePane = page.getByTestId("note-editor-source-pane");
  const previewPane = page.getByTestId("note-editor-preview-pane");

  await expect(page.getByRole("heading", { name: "Edit draft note" })).toBeVisible();
  await expect(editButton).toHaveAttribute("aria-pressed", "true");
  await expect(sourcePane).toBeVisible();
  await expect(previewPane).toBeHidden();

  await previewButton.click();
  await expect(previewButton).toHaveAttribute("aria-pressed", "true");
  await expect(sourcePane).toBeHidden();
  await expect(previewPane).toBeVisible();
  await expectMermaidPreviewContent(page);
  await expectMermaidPreviewSurface(page);
  await expectNoHorizontalOverflow(page);

  await editButton.click();
  await expect(editButton).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByTestId("note-markdown-input")).toHaveValue(seededNote.markdown);

  await expect(page.locator(".note-editor-shell")).toHaveScreenshot("ui-note-editor-mermaid-mobile.png", {
    animations: "disabled",
    maxDiffPixels: 1000
  });
});
