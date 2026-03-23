import { spawn } from "node:child_process";
import { createWriteStream, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const npmBin = process.platform === "win32" ? "npm.cmd" : "npm";
const host = "0.0.0.0";
const port = process.env.PORT ?? "3000";
const logsDir = path.resolve("logs");
const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const logFile = path.join(logsDir, `server-${timestamp}.log`);

mkdirSync(logsDir, { recursive: true });

const logStream = createWriteStream(logFile, { flags: "a" });

let activeChild = null;

function pipeChildOutput(child) {
  child.stdout.pipe(process.stdout);
  child.stderr.pipe(process.stderr);
  child.stdout.pipe(logStream, { end: false });
  child.stderr.pipe(logStream, { end: false });
}

function forwardSignal(signal) {
  if (activeChild && !activeChild.killed) {
    activeChild.kill(signal);
  }
}

function getSqliteDirectory(databaseUrl) {
  if (!databaseUrl?.startsWith("file:")) {
    return null;
  }

  const rawPath = databaseUrl.slice("file:".length);

  if (!rawPath || rawPath === ":memory:") {
    return null;
  }

  const sqlitePath = path.isAbsolute(rawPath) ? rawPath : path.resolve(rawPath);

  return path.dirname(sqlitePath);
}

async function ensureRuntimePaths() {
  const mediaRoot = path.resolve(process.env.MEDIA_ROOT ?? path.join(tmpdir(), "minakeep-media"));
  const sqliteDirectory = getSqliteDirectory(process.env.DATABASE_URL);

  mkdirSync(logsDir, { recursive: true });
  mkdirSync(mediaRoot, { recursive: true });

  if (sqliteDirectory) {
    mkdirSync(sqliteDirectory, { recursive: true });
  }
}

function run(command, args, env = process.env) {
  return new Promise((resolve, reject) => {
    activeChild = spawn(command, args, {
      cwd: process.cwd(),
      env,
      stdio: ["ignore", "pipe", "pipe"]
    });

    pipeChildOutput(activeChild);

    activeChild.on("exit", (code) => {
      activeChild = null;

      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${command} ${args.join(" ")} failed with exit code ${code ?? "unknown"}`));
    });
  });
}

process.on("SIGINT", () => {
  forwardSignal("SIGINT");
});

process.on("SIGTERM", () => {
  forwardSignal("SIGTERM");
});

await ensureRuntimePaths();

console.log(`Server logs: ${logFile}`);
console.log(`LOG_LEVEL=${process.env.LOG_LEVEL ?? "info"}`);
console.log("Preparing runtime state with `npm run db:prepare` before startup. Existing SQLite installs get a pre-upgrade backup when schema changes are detected.");

try {
  await run(npmBin, ["run", "db:prepare"]);
} catch (error) {
  logStream.end();
  throw error;
}

activeChild = spawn(npmBin, ["run", "start", "--", "--hostname", host, "--port", port], {
  cwd: process.cwd(),
  env: {
    ...process.env,
    PORT: port
  },
  stdio: ["ignore", "pipe", "pipe"]
});

pipeChildOutput(activeChild);

const exitCode = await new Promise((resolve) => {
  activeChild.on("exit", (code) => {
    activeChild = null;
    resolve(code ?? 0);
  });
});

logStream.end();
process.exit(exitCode);
