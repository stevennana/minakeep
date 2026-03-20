import { mkdirSync, createWriteStream, existsSync } from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";

const npmBin = process.platform === "win32" ? "npm.cmd" : "npm";
const logsDir = path.resolve("logs");
const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const logFile = path.join(logsDir, `server-${timestamp}.log`);
const port = process.env.PORT ?? "3000";

mkdirSync(logsDir, { recursive: true });

const prepare = spawn(npmBin, ["run", "db:prepare"], {
  cwd: process.cwd(),
  stdio: "inherit",
  env: process.env
});

const prepareCode = await new Promise((resolve) => {
  prepare.on("exit", (code) => resolve(code ?? 1));
});

if (prepareCode !== 0) {
  process.exit(prepareCode);
}

if (!existsSync(path.resolve(".next", "BUILD_ID"))) {
  const build = spawn(npmBin, ["run", "build"], {
    cwd: process.cwd(),
    stdio: "inherit",
    env: process.env
  });

  const buildCode = await new Promise((resolve) => {
    build.on("exit", (code) => resolve(code ?? 1));
  });

  if (buildCode !== 0) {
    process.exit(buildCode);
  }
}

const stream = createWriteStream(logFile, { flags: "a" });
const child = spawn(npmBin, ["run", "start", "--", "--hostname", "127.0.0.1", "--port", port], {
  cwd: process.cwd(),
  env: process.env
});

child.stdout.pipe(process.stdout);
child.stderr.pipe(process.stderr);
child.stdout.pipe(stream);
child.stderr.pipe(stream);

console.log(`Server logs: ${logFile}`);
console.log(`LOG_LEVEL=${process.env.LOG_LEVEL ?? "info"}`);

child.on("exit", (code) => {
  stream.end();
  process.exit(code ?? 0);
});
