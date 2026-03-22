import "dotenv/config";

import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";
import { expect, test, type Page } from "@playwright/test";

import { setAiPlaywrightTestMode } from "./ai-test-mode";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL must be set before running external note API tests.");
}

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({
    url: databaseUrl
  })
});

const EXTERNAL_NOTE_API_KEY_HEADER = "X-API-Key";
const apiKey = process.env.API_KEY ?? "minakeep-playwright-api-key";

async function signInAsOwner(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Username").fill(process.env.OWNER_USERNAME ?? "owner");
  await page.getByLabel("Password").fill(process.env.OWNER_PASSWORD ?? "minakeep-local-password");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/app$/);
}

test.describe.configure({ mode: "serial" });

test("@note-api keyed note-create requests make a private owner note and queue note enrichment", async ({ page, request }) => {
  const uniqueId = `${Date.now()}`;
  const title = `API draft note ${uniqueId}`;
  const markdown = `# API draft ${uniqueId}

This note should stay private unless publish-on-create is requested.`;
  let createdNoteId: string | null = null;

  await setAiPlaywrightTestMode("success");

  try {
    const response = await request.post("/api/open/notes", {
      data: {
        title,
        markdown
      },
      headers: {
        [EXTERNAL_NOTE_API_KEY_HEADER]: apiKey
      }
    });

    expect(response.status()).toBe(201);

    const body = (await response.json()) as {
      note: {
        id: string;
        isPublished: boolean;
        slug: string;
        title: string;
      };
      ownerUrl: string;
      publicUrl: string | null;
    };

    createdNoteId = body.note.id;

    expect(body.note.title).toBe(title);
    expect(body.note.isPublished).toBe(false);
    expect(body.ownerUrl).toBe(`/app/notes/${body.note.id}/edit`);
    expect(body.publicUrl).toBeNull();

    await expect
      .poll(
        async () => {
          const note = await prisma.note.findUnique({
            where: {
              id: body.note.id
            },
            select: {
              enrichmentStatus: true,
              isPublished: true,
              summary: true
            }
          });

          return {
            enrichmentStatus: note?.enrichmentStatus ?? null,
            isPublished: note?.isPublished ?? null,
            hasSummary: Boolean(note?.summary)
          };
        },
        {
          timeout: 15000
        }
      )
      .toMatchObject({
        enrichmentStatus: "ready",
        isPublished: false,
        hasSummary: true
      });

    await signInAsOwner(page);
    await page.goto(body.ownerUrl);
    await expect(page.getByRole("textbox", { name: /^Title$/ })).toHaveValue(title);
    await expect(page.getByTestId("note-enrichment-panel")).toContainText("AI ready");

    await page.goto("/");
    await expect(page.getByRole("link", { name: title })).toHaveCount(0);
  } finally {
    await setAiPlaywrightTestMode("passthrough");

    if (createdNoteId) {
      await prisma.note.delete({
        where: {
          id: createdNoteId
        }
      });
    }
  }
});

test("@note-api publish-on-create uses the existing note publish path and returns the public URL", async ({ page, request }) => {
  const uniqueId = `${Date.now()}`;
  const title = `API published note ${uniqueId}`;
  const markdown = `## API published ${uniqueId}

This note should be publicly reachable immediately after the keyed create request.`;
  let createdNoteId: string | null = null;

  await setAiPlaywrightTestMode("success");

  try {
    const response = await request.post("/api/open/notes", {
      data: {
        isPublished: true,
        markdown,
        title
      },
      headers: {
        [EXTERNAL_NOTE_API_KEY_HEADER]: apiKey
      }
    });

    expect(response.status()).toBe(201);

    const body = (await response.json()) as {
      note: {
        id: string;
        isPublished: boolean;
        slug: string;
      };
      ownerUrl: string;
      publicUrl: string | null;
    };

    createdNoteId = body.note.id;

    expect(body.note.isPublished).toBe(true);
    expect(body.ownerUrl).toBe(`/app/notes/${body.note.id}/edit`);
    expect(body.publicUrl).toBe(`/notes/${body.note.slug}`);

    await expect
      .poll(
        async () =>
          prisma.note.findUnique({
            where: {
              id: body.note.id
            },
            select: {
              enrichmentStatus: true,
              isPublished: true
            }
          }),
        {
          timeout: 15000
        }
      )
      .toMatchObject({
        enrichmentStatus: "ready",
        isPublished: true
      });

    await page.goto("/");
    await expect(page.getByRole("link", { name: title })).toBeVisible();

    await page.goto(body.publicUrl ?? "/");
    await expect(page).toHaveURL(new RegExp(`/notes/${body.note.slug}$`));
    await expect(page.getByTestId("public-note-markdown").getByRole("heading", { name: `API published ${uniqueId}` })).toBeVisible();
  } finally {
    await setAiPlaywrightTestMode("passthrough");

    if (createdNoteId) {
      await prisma.note.delete({
        where: {
          id: createdNoteId
        }
      });
    }
  }
});

test("@note-api rejects note-create requests without X-API-Key and does not persist a note", async ({ request }) => {
  const uniqueId = `${Date.now()}`;
  const title = `API missing key note ${uniqueId}`;
  const markdown = `# Missing key ${uniqueId}

This request should fail closed before note persistence.`;

  const response = await request.post("/api/open/notes", {
    data: {
      markdown,
      title
    }
  });

  expect(response.status()).toBe(401);
  await expect(response.json()).resolves.toEqual({
    error: "Unauthorized."
  });

  const persistedNote = await prisma.note.findFirst({
    where: {
      title
    },
    select: {
      id: true
    }
  });

  expect(persistedNote).toBeNull();
});

test("@note-api rejects note-create requests with an invalid X-API-Key and does not persist a note", async ({
  request
}) => {
  const uniqueId = `${Date.now()}`;
  const title = `API invalid key note ${uniqueId}`;
  const markdown = `# Invalid key ${uniqueId}

This request should fail closed before note persistence.`;

  const response = await request.post("/api/open/notes", {
    data: {
      markdown,
      title
    },
    headers: {
      [EXTERNAL_NOTE_API_KEY_HEADER]: `${apiKey}-wrong`
    }
  });

  expect(response.status()).toBe(401);
  await expect(response.json()).resolves.toEqual({
    error: "Unauthorized."
  });

  const persistedNote = await prisma.note.findFirst({
    where: {
      title
    },
    select: {
      id: true
    }
  });

  expect(persistedNote).toBeNull();
});

test("@note-api rejects keyed note-create requests with unsupported top-level fields", async ({ request }) => {
  const uniqueId = `${Date.now()}`;
  const title = `API invalid shape note ${uniqueId}`;
  const markdown = `# Invalid shape ${uniqueId}

This request should be rejected before note persistence.`;

  const response = await request.post("/api/open/notes", {
    data: {
      markdown,
      slug: `caller-slug-${uniqueId}`,
      title
    },
    headers: {
      [EXTERNAL_NOTE_API_KEY_HEADER]: apiKey
    }
  });

  expect(response.status()).toBe(400);
  await expect(response.json()).resolves.toEqual({
    error: "Unsupported field(s): slug."
  });

  const persistedNote = await prisma.note.findFirst({
    where: {
      title
    },
    select: {
      id: true
    }
  });

  expect(persistedNote).toBeNull();
});
