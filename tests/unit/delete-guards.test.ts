import assert from "node:assert/strict";
import test from "node:test";

process.env.AUTH_SECRET ??= "minakeep-delete-guards-secret";
process.env.DATABASE_URL ??= "file:/tmp/minakeep-delete-guards.db";
process.env.OWNER_USERNAME ??= "owner";
process.env.OWNER_PASSWORD ??= "owner-password";

type DeleteGuardModules = {
  deleteDraftNote: typeof import("../../src/features/notes/service").deleteDraftNote;
  deleteSavedLink: typeof import("../../src/features/links/service").deleteSavedLink;
  PublishedLinkDeleteForbiddenError: typeof import("../../src/features/links/service").PublishedLinkDeleteForbiddenError;
  PublishedNoteDeleteForbiddenError: typeof import("../../src/features/notes/service").PublishedNoteDeleteForbiddenError;
  linksRepo: typeof import("../../src/features/links/repo").linksRepo;
  notesRepo: typeof import("../../src/features/notes/repo").notesRepo;
};

let cachedModulesPromise: Promise<DeleteGuardModules> | null = null;

function loadDeleteGuardModules() {
  if (!cachedModulesPromise) {
    cachedModulesPromise = Promise.all([
      import("../../src/features/links/repo"),
      import("../../src/features/links/service"),
      import("../../src/features/notes/repo"),
      import("../../src/features/notes/service")
    ]).then(([linksRepoModule, linksServiceModule, notesRepoModule, notesServiceModule]) => ({
      deleteDraftNote: notesServiceModule.deleteDraftNote,
      deleteSavedLink: linksServiceModule.deleteSavedLink,
      PublishedLinkDeleteForbiddenError: linksServiceModule.PublishedLinkDeleteForbiddenError,
      PublishedNoteDeleteForbiddenError: notesServiceModule.PublishedNoteDeleteForbiddenError,
      linksRepo: linksRepoModule.linksRepo,
      notesRepo: notesRepoModule.notesRepo
    }));
  }

  return cachedModulesPromise;
}

async function withMockedNotesRepo<T>(
  overrides: Partial<Pick<DeleteGuardModules["notesRepo"], "delete" | "findByIdForOwner">>,
  run: () => Promise<T>
) {
  const { notesRepo } = await loadDeleteGuardModules();
  const originalFindByIdForOwner = notesRepo.findByIdForOwner;
  const originalDelete = notesRepo.delete;

  if (overrides.findByIdForOwner) {
    notesRepo.findByIdForOwner = overrides.findByIdForOwner;
  }

  if (overrides.delete) {
    notesRepo.delete = overrides.delete;
  }

  try {
    return await run();
  } finally {
    notesRepo.findByIdForOwner = originalFindByIdForOwner;
    notesRepo.delete = originalDelete;
  }
}

async function withMockedLinksRepo<T>(
  overrides: Partial<Pick<DeleteGuardModules["linksRepo"], "delete" | "findByIdForOwner">>,
  run: () => Promise<T>
) {
  const { linksRepo } = await loadDeleteGuardModules();
  const originalFindByIdForOwner = linksRepo.findByIdForOwner;
  const originalDelete = linksRepo.delete;

  if (overrides.findByIdForOwner) {
    linksRepo.findByIdForOwner = overrides.findByIdForOwner;
  }

  if (overrides.delete) {
    linksRepo.delete = overrides.delete;
  }

  try {
    return await run();
  } finally {
    linksRepo.findByIdForOwner = originalFindByIdForOwner;
    linksRepo.delete = originalDelete;
  }
}

test("deleteDraftNote rejects published notes before any delete runs", async () => {
  const { deleteDraftNote, PublishedNoteDeleteForbiddenError, notesRepo } = await loadDeleteGuardModules();
  let deleteCalled = false;

  await withMockedNotesRepo(
    {
      async findByIdForOwner() {
        return { isPublished: true } as NonNullable<Awaited<ReturnType<typeof notesRepo.findByIdForOwner>>>;
      },
      async delete() {
        deleteCalled = true;
        throw new Error("delete should not be called for published notes");
      }
    },
    async () => {
      await assert.rejects(() => deleteDraftNote("owner-1", "note-1"), PublishedNoteDeleteForbiddenError);
    }
  );

  assert.equal(deleteCalled, false);
});

test("deleteDraftNote deletes unpublished notes through the repository", async () => {
  const { deleteDraftNote, notesRepo } = await loadDeleteGuardModules();
  const deletedNote = { id: "note-1", isPublished: false } as Awaited<ReturnType<typeof notesRepo.delete>>;
  let deleteArgument = "";

  const result = await withMockedNotesRepo(
    {
      async findByIdForOwner() {
        return { isPublished: false } as NonNullable<Awaited<ReturnType<typeof notesRepo.findByIdForOwner>>>;
      },
      async delete(id: string) {
        deleteArgument = id;
        return deletedNote;
      }
    },
    async () => deleteDraftNote("owner-1", "note-1")
  );

  assert.equal(deleteArgument, "note-1");
  assert.equal(result, deletedNote);
});

test("deleteSavedLink rejects published links before any delete runs", async () => {
  const { deleteSavedLink, PublishedLinkDeleteForbiddenError, linksRepo } = await loadDeleteGuardModules();
  let deleteCalled = false;

  await withMockedLinksRepo(
    {
      async findByIdForOwner() {
        return { isPublished: true } as NonNullable<Awaited<ReturnType<typeof linksRepo.findByIdForOwner>>>;
      },
      async delete() {
        deleteCalled = true;
        throw new Error("delete should not be called for published links");
      }
    },
    async () => {
      await assert.rejects(() => deleteSavedLink("owner-1", "link-1"), PublishedLinkDeleteForbiddenError);
    }
  );

  assert.equal(deleteCalled, false);
});

test("deleteSavedLink deletes unpublished links through the repository", async () => {
  const { deleteSavedLink, linksRepo } = await loadDeleteGuardModules();
  const deletedLink = { id: "link-1", isPublished: false } as Awaited<ReturnType<typeof linksRepo.delete>>;
  let deleteArgument = "";

  const result = await withMockedLinksRepo(
    {
      async findByIdForOwner() {
        return { isPublished: false } as NonNullable<Awaited<ReturnType<typeof linksRepo.findByIdForOwner>>>;
      },
      async delete(id: string) {
        deleteArgument = id;
        return deletedLink;
      }
    },
    async () => deleteSavedLink("owner-1", "link-1")
  );

  assert.equal(deleteArgument, "link-1");
  assert.equal(result, deletedLink);
});
