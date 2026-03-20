import { spawn } from "node:child_process";
import { createWriteStream, mkdirSync } from "node:fs";
import path from "node:path";

const npmBin = process.platform === "win32" ? "npm.cmd" : "npm";
const host = process.env.PLAYWRIGHT_WEB_SERVER_HOST ?? "127.0.0.1";
const port = process.env.PLAYWRIGHT_WEB_SERVER_PORT ?? "3100";
const logPath = process.env.MINAKEEP_NEXT_SERVER_LOG;

const logStream = (() => {
  if (!logPath) {
    return null;
  }

  mkdirSync(path.dirname(logPath), { recursive: true });
  return createWriteStream(logPath, { flags: "a" });
})();

const child = spawn(npmBin, ["run", "dev", "--", "--hostname", host, "--port", port], {
  cwd: process.cwd(),
  env: process.env
});

if (logPath) {
  console.log(`Playwright server log: ${logPath}`);
}

child.stdout.pipe(process.stdout);
child.stderr.pipe(process.stderr);

if (logStream) {
  child.stdout.pipe(logStream);
  child.stderr.pipe(logStream);
}

function forwardSignal(signal) {
  if (!child.killed) {
    child.kill(signal);
  }
}

process.on("SIGINT", () => {
  forwardSignal("SIGINT");
});

process.on("SIGTERM", () => {
  forwardSignal("SIGTERM");
});

child.on("exit", (code) => {
  logStream?.end();
  process.exit(code ?? 0);
});
