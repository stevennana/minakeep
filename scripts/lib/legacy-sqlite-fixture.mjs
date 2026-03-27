import Database from "better-sqlite3";

export function createLegacyUpgradeFixture(databasePath) {
  const database = new Database(databasePath);
  const legacyNoteMarkdown = `# Legacy note

Euler kept $e^{i\\pi} + 1 = 0$ in the margin.

$$
\\int_0^1 x^2 \\, dx
$$`;

  try {
    database.exec(`
      PRAGMA foreign_keys = ON;

      CREATE TABLE "User" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "username" TEXT NOT NULL,
        "passwordHash" TEXT NOT NULL,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

      CREATE TABLE "Note" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "ownerId" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "slug" TEXT NOT NULL,
        "markdown" TEXT NOT NULL,
        "excerpt" TEXT NOT NULL,
        "summary" TEXT,
        "enrichmentStatus" TEXT NOT NULL DEFAULT 'pending',
        "enrichmentError" TEXT,
        "enrichmentAttempts" INTEGER NOT NULL DEFAULT 0,
        "isPublished" INTEGER NOT NULL DEFAULT 0,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Note_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
      );

      CREATE UNIQUE INDEX "Note_slug_key" ON "Note"("slug");

      CREATE TABLE "Link" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "ownerId" TEXT NOT NULL,
        "url" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "summary" TEXT,
        "enrichmentStatus" TEXT NOT NULL DEFAULT 'pending',
        "enrichmentError" TEXT,
        "enrichmentAttempts" INTEGER NOT NULL DEFAULT 0,
        "isPublished" INTEGER NOT NULL DEFAULT 0,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Link_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
      );

      CREATE UNIQUE INDEX "Link_ownerId_url_key" ON "Link"("ownerId", "url");

      CREATE TABLE "Tag" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");

      CREATE TABLE "_NoteToTag" (
        "A" TEXT NOT NULL,
        "B" TEXT NOT NULL,
        CONSTRAINT "_NoteToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "Note" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "_NoteToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag" ("id") ON DELETE CASCADE ON UPDATE CASCADE
      );

      CREATE UNIQUE INDEX "_NoteToTag_AB_unique" ON "_NoteToTag"("A", "B");
      CREATE INDEX "_NoteToTag_B_index" ON "_NoteToTag"("B");

      CREATE TABLE "_LinkToTag" (
        "A" TEXT NOT NULL,
        "B" TEXT NOT NULL,
        CONSTRAINT "_LinkToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "Link" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "_LinkToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag" ("id") ON DELETE CASCADE ON UPDATE CASCADE
      );

      CREATE UNIQUE INDEX "_LinkToTag_AB_unique" ON "_LinkToTag"("A", "B");
      CREATE INDEX "_LinkToTag_B_index" ON "_LinkToTag"("B");
    `);

    database.prepare(`INSERT INTO "User" ("id", "username", "passwordHash") VALUES (?, ?, ?)`).run("owner-1", "owner", "legacy-hash");
    database
      .prepare(
        `INSERT INTO "Note" ("id", "ownerId", "title", "slug", "markdown", "excerpt", "summary", "isPublished") VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run("note-1", "owner-1", "Legacy note", "legacy-note", legacyNoteMarkdown, "Legacy excerpt", "Legacy summary", 1);
    database
      .prepare(`INSERT INTO "Link" ("id", "ownerId", "url", "title", "summary", "isPublished") VALUES (?, ?, ?, ?, ?, ?)`)
      .run("link-1", "owner-1", "https://example.com/legacy", "Legacy link", "Legacy link summary", 1);
    database.prepare(`INSERT INTO "Tag" ("id", "name") VALUES (?, ?)`).run("tag-1", "legacy");
    database.prepare(`INSERT INTO "_NoteToTag" ("A", "B") VALUES (?, ?)`).run("note-1", "tag-1");
    database.prepare(`INSERT INTO "_LinkToTag" ("A", "B") VALUES (?, ?)`).run("link-1", "tag-1");
  } finally {
    database.close();
  }
}
