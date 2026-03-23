import { existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync } from "node:fs";
import { spawn } from "node:child_process";
import path from "node:path";

import { createLegacyUpgradeFixture } from "./lib/legacy-sqlite-fixture.mjs";

const port = process.env.SMOKE_PORT ?? "3200";
const host = "127.0.0.1";
const npmBin = process.platform === "win32" ? "npm.cmd" : "npm";
const probePaths = (process.env.SMOKE_PROBE_PATHS ?? "")
  .split(",")
  .map((path) => path.trim())
  .filter(Boolean);

function run(command, args, env = process.env) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: process.cwd(),
      stdio: "inherit",
      env
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

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForHealth(url) {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return;
      }
    } catch {
      // Keep polling until the server is ready.
    }
    await sleep(1000);
  }
  throw new Error(`Timed out waiting for ${url}`);
}

async function verifyProbePath(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Smoke probe failed for ${url} with status ${response.status}`);
  }
}

async function runSmokeScenario({ env = process.env, probePaths: scenarioProbePaths = [] } = {}) {
  await run(npmBin, ["run", "db:prepare"], env);

  if (!existsSync(".next/BUILD_ID")) {
    await run(npmBin, ["run", "build"], env);
  }

  const child = spawn(npmBin, ["run", "start", "--", "--hostname", host, "--port", port], {
    cwd: process.cwd(),
    stdio: "inherit",
    env: {
      ...env,
      PORT: port
    }
  });

  try {
    await waitForHealth(`http://${host}:${port}/api/health`);

    for (const probePath of scenarioProbePaths) {
      const normalizedPath = probePath.startsWith("/") ? probePath : `/${probePath}`;
      await verifyProbePath(`http://${host}:${port}${normalizedPath}`);
    }
  } finally {
    child.kill("SIGTERM");
  }
}

await runSmokeScenario({
  probePaths
});

const legacySmokeRoot = path.resolve("tmp");
mkdirSync(legacySmokeRoot, { recursive: true });
const legacySmokeDirectory = mkdtempSync(path.join(legacySmokeRoot, "legacy-upgrade-smoke-"));
const legacyDatabasePath = path.join(legacySmokeDirectory, "minakeep.db");
const legacyEnv = {
  ...process.env,
  AUTH_SECRET: process.env.AUTH_SECRET ?? "minakeep-smoke-upgrade-secret",
  AUTH_TRUST_HOST: process.env.AUTH_TRUST_HOST ?? "true",
  DATABASE_URL: `file:${legacyDatabasePath}`,
  MEDIA_ROOT: path.join(legacySmokeDirectory, "media"),
  OWNER_USERNAME: process.env.OWNER_USERNAME ?? "owner",
  OWNER_PASSWORD: process.env.OWNER_PASSWORD ?? "owner-password"
};

createLegacyUpgradeFixture(legacyDatabasePath);

try {
  await runSmokeScenario({
    env: legacyEnv,
    probePaths: ["/", "/notes/legacy-note"]
  });

  const backupRoots = readdirSync(path.join(legacySmokeDirectory, "backups"));

  if (backupRoots.length !== 1 || !existsSync(path.join(legacySmokeDirectory, "backups", backupRoots[0], "minakeep.db"))) {
    throw new Error("Legacy upgrade smoke expected exactly one restore-ready SQLite backup after db:prepare.");
  }
} finally {
  rmSync(legacySmokeDirectory, { recursive: true, force: true });
}
