import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import Database from "better-sqlite3";

const repoRoot = process.cwd();
const prismaBin = path.resolve(repoRoot, "node_modules", ".bin", process.platform === "win32" ? "prisma.cmd" : "prisma");
const schemaPath = path.resolve(repoRoot, "prisma", "schema.prisma");

type BackupSqliteBeforeSchemaPush = (options: {
  databaseUrl?: string;
  prismaBin: string;
  schemaPath: string;
  cwd?: string;
  env?: NodeJS.ProcessEnv;
  logger?: {
    log(message: string): void;
  };
}) => Promise<{
  state: "skipped-non-sqlite" | "skipped-missing" | "skipped-in-sync" | "backed-up";
  databasePath?: string;
  backupDirectory?: string;
}>;

function run(command: string, args: string[], env: NodeJS.ProcessEnv) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: repoRoot,
      env,
      stdio: ["ignore", "pipe", "pipe"]
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${command} ${args.join(" ")} failed with exit code ${code ?? "unknown"}\n${stdout}${stderr}`.trim()));
    });
  });
}

function createLegacyDatabase(databasePath: string) {
  const db = new Database(databasePath);

  db.exec(`
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

  db.prepare(`INSERT INTO "User" ("id", "username", "passwordHash") VALUES (?, ?, ?)`).run("owner-1", "owner", "legacy-hash");
  db.prepare(
    `INSERT INTO "Note" ("id", "ownerId", "title", "slug", "markdown", "excerpt", "summary", "isPublished") VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run("note-1", "owner-1", "Legacy note", "legacy-note", "# Legacy note", "Legacy excerpt", "Legacy summary", 1);
  db.prepare(`INSERT INTO "Link" ("id", "ownerId", "url", "title", "summary", "isPublished") VALUES (?, ?, ?, ?, ?, ?)`).run(
    "link-1",
    "owner-1",
    "https://example.com/legacy",
    "Legacy link",
    "Legacy link summary",
    1
  );
  db.prepare(`INSERT INTO "Tag" ("id", "name") VALUES (?, ?)`).run("tag-1", "legacy");
  db.prepare(`INSERT INTO "_NoteToTag" ("A", "B") VALUES (?, ?)`).run("note-1", "tag-1");
  db.prepare(`INSERT INTO "_LinkToTag" ("A", "B") VALUES (?, ?)`).run("link-1", "tag-1");

  db.close();
}

async function loadBackupSqliteBeforeSchemaPush(): Promise<BackupSqliteBeforeSchemaPush> {
  const sqliteUpgradeModulePath = "../../scripts/lib/sqlite-upgrade.mjs";
  const sqliteUpgradeModule = (await import(sqliteUpgradeModulePath)) as {
    backupSqliteBeforeSchemaPush: BackupSqliteBeforeSchemaPush;
  };

  return sqliteUpgradeModule.backupSqliteBeforeSchemaPush;
}

test(
  "older SQLite installs get a pre-upgrade backup before the current schema is applied",
  { timeout: 60_000 },
  async () => {
    const tempDirectory = mkdtempSync(path.join(tmpdir(), "minakeep-upgrade-"));

    try {
      const databasePath = path.join(tempDirectory, "minakeep.db");
      const databaseUrl = `file:${databasePath}`;

      createLegacyDatabase(databasePath);

      const env = {
        ...process.env,
        DATABASE_URL: databaseUrl,
        OWNER_USERNAME: "owner",
        OWNER_PASSWORD: "owner-password"
      };
      const backupSqliteBeforeSchemaPush = await loadBackupSqliteBeforeSchemaPush();

      const logMessages: string[] = [];
      const upgradeResult = await backupSqliteBeforeSchemaPush({
        databaseUrl,
        prismaBin,
        schemaPath,
        env,
        logger: {
          log(message: string) {
            logMessages.push(message);
          }
        }
      });

      assert.equal(upgradeResult.state, "backed-up");
      assert.ok(upgradeResult.backupDirectory);
      assert.ok(existsSync(path.join(upgradeResult.backupDirectory, "minakeep.db")));
      assert.match(logMessages.join("\n"), /Created pre-upgrade SQLite backup/);

      await run(prismaBin, ["db", "push", "--accept-data-loss"], env);
      await run(process.execPath, ["--import", "tsx", "prisma/seed.ts"], env);

      const backupRoots = readdirSync(path.join(tempDirectory, "backups"));
      assert.equal(backupRoots.length, 1);

      const upgradedDatabase = new Database(databasePath, { readonly: true });
      const backupDatabase = new Database(path.join(upgradeResult.backupDirectory, "minakeep.db"), { readonly: true });

      try {
        const upgradedTables = upgradedDatabase
          .prepare(`SELECT name FROM sqlite_master WHERE type = 'table' AND name IN ('SiteSettings', 'MediaAsset') ORDER BY name`)
          .all() as Array<{ name: string }>;
        const upgradedNoteColumns = upgradedDatabase.prepare(`PRAGMA table_info("Note")`).all() as Array<{ name: string }>;
        const upgradedNote = upgradedDatabase
          .prepare(`SELECT "title", "slug", "isPublished" FROM "Note" WHERE "id" = ?`)
          .get("note-1") as { isPublished: number; slug: string; title: string } | undefined;

        const backupTables = backupDatabase
          .prepare(`SELECT name FROM sqlite_master WHERE type = 'table' AND name IN ('SiteSettings', 'MediaAsset') ORDER BY name`)
          .all() as Array<{ name: string }>;
        const backupNoteColumns = backupDatabase.prepare(`PRAGMA table_info("Note")`).all() as Array<{ name: string }>;

        assert.deepEqual(
          upgradedTables.map((table) => table.name),
          ["MediaAsset", "SiteSettings"]
        );
        assert.ok(upgradedNoteColumns.some((column) => column.name === "publishedAt"));
        assert.ok(upgradedNoteColumns.some((column) => column.name === "enrichmentUpdatedAt"));
        assert.deepEqual(upgradedNote, {
          isPublished: 1,
          slug: "legacy-note",
          title: "Legacy note"
        });

        assert.deepEqual(backupTables, []);
        assert.ok(!backupNoteColumns.some((column) => column.name === "publishedAt"));
        assert.ok(!backupNoteColumns.some((column) => column.name === "enrichmentUpdatedAt"));
      } finally {
        upgradedDatabase.close();
        backupDatabase.close();
      }
    } finally {
      rmSync(tempDirectory, { recursive: true, force: true });
    }
  }
);
