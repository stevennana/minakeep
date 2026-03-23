import { spawn } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import path from "node:path";

const SQLITE_SIDE_CAR_SUFFIXES = ["", "-shm", "-wal"];

function run(command, args, { cwd = process.cwd(), env = process.env, allowedExitCodes = [] } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
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
      const exitCode = code ?? 1;

      if (exitCode === 0 || allowedExitCodes.includes(exitCode)) {
        resolve({
          exitCode,
          stderr,
          stdout
        });
        return;
      }

      reject(
        new Error(
          `${command} ${args.join(" ")} failed with exit code ${exitCode}\n${stdout}${stderr}`.trim()
        )
      );
    });
  });
}

export function getSqliteDatabasePath(databaseUrl, cwd = process.cwd()) {
  if (!databaseUrl?.startsWith("file:")) {
    return null;
  }

  const [rawPath] = databaseUrl.slice("file:".length).split("?");

  if (!rawPath || rawPath === ":memory:") {
    return null;
  }

  return path.isAbsolute(rawPath) ? rawPath : path.resolve(cwd, rawPath);
}

export function createSqliteBackup(databasePath, timestamp = new Date()) {
  const parsedPath = path.parse(databasePath);
  const safeTimestamp = timestamp.toISOString().replace(/[:.]/g, "-");
  const backupDirectory = path.join(parsedPath.dir, "backups", `${parsedPath.name}-pre-upgrade-${safeTimestamp}`);

  mkdirSync(backupDirectory, { recursive: true });

  for (const suffix of SQLITE_SIDE_CAR_SUFFIXES) {
    const sourcePath = `${databasePath}${suffix}`;

    if (!existsSync(sourcePath)) {
      continue;
    }

    copyFileSync(sourcePath, path.join(backupDirectory, `${parsedPath.base}${suffix}`));
  }

  return backupDirectory;
}

export async function backupSqliteBeforeSchemaPush({
  databaseUrl,
  prismaBin,
  schemaPath,
  cwd = process.cwd(),
  env = process.env,
  logger = console
}) {
  const databasePath = getSqliteDatabasePath(databaseUrl, cwd);

  if (!databasePath) {
    logger.log("Skipping pre-upgrade SQLite backup because DATABASE_URL is not a file-based SQLite path.");
    return {
      state: "skipped-non-sqlite"
    };
  }

  if (!existsSync(databasePath)) {
    logger.log(`No existing SQLite database at ${databasePath}; skipping pre-upgrade backup.`);
    return {
      databasePath,
      state: "skipped-missing"
    };
  }

  const diffResult = await run(
    prismaBin,
    ["migrate", "diff", "--from-config-datasource", "--to-schema", schemaPath, "--exit-code"],
    {
      allowedExitCodes: [2],
      cwd,
      env
    }
  );

  if (diffResult.exitCode === 0) {
    logger.log(`SQLite schema already matches Prisma schema at ${databasePath}; skipping pre-upgrade backup.`);
    return {
      databasePath,
      state: "skipped-in-sync"
    };
  }

  const backupDirectory = createSqliteBackup(databasePath);

  logger.log(`Created pre-upgrade SQLite backup in ${backupDirectory} before applying schema changes to ${databasePath}.`);

  return {
    backupDirectory,
    databasePath,
    state: "backed-up"
  };
}
