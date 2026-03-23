import "dotenv/config";

import { spawn } from "node:child_process";
import path from "node:path";

import { applyRuntimeSqliteUpgrades, backupSqliteBeforeSchemaPush } from "./lib/sqlite-upgrade.mjs";

const BIN_DIR = path.resolve("node_modules", ".bin");
const prismaBin = path.join(BIN_DIR, process.platform === "win32" ? "prisma.cmd" : "prisma");
const nodeBin = process.execPath;
const schemaPath = path.resolve("prisma", "schema.prisma");

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: process.cwd(),
      stdio: "inherit",
      env: process.env
    });

    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`${command} ${args.join(" ")} failed with exit code ${code ?? "unknown"}`));
    });
  });
}

await run(prismaBin, ["generate"]);
await backupSqliteBeforeSchemaPush({
  databaseUrl: process.env.DATABASE_URL,
  prismaBin,
  schemaPath
});
await run(prismaBin, ["db", "push", "--accept-data-loss"]);
applyRuntimeSqliteUpgrades({
  databaseUrl: process.env.DATABASE_URL
});
await run(nodeBin, ["--import", "tsx", "prisma/seed.ts"]);
