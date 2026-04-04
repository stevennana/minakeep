import "dotenv/config";

import { spawn } from "node:child_process";
import { createWriteStream, mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const npmBin = process.platform === "win32" ? "npm.cmd" : "npm";
const host = process.env.PLAYWRIGHT_WEB_SERVER_HOST ?? "127.0.0.1";
const port = process.env.PLAYWRIGHT_WEB_SERVER_PORT ?? "3210";
const logPath = process.env.MINAKEEP_NEXT_SERVER_LOG;
const aiTestModeFile = process.env.PLAYWRIGHT_AI_TEST_MODE_FILE ?? path.join(tmpdir(), "minakeep-playwright-ai-mode.json");
const linkFaviconTestModeFile =
  process.env.PLAYWRIGHT_LINK_FAVICON_TEST_MODE_FILE ?? path.join(tmpdir(), "minakeep-playwright-link-favicon-mode.json");
const publicSiteUrlFile =
  process.env.PLAYWRIGHT_PUBLIC_SITE_URL_FILE ?? path.join(tmpdir(), "minakeep-playwright-public-site-url.json");

const logStream = (() => {
  if (!logPath) {
    return null;
  }

  mkdirSync(path.dirname(logPath), { recursive: true });
  return createWriteStream(logPath, { flags: "a" });
})();

rmSync(aiTestModeFile, { force: true });
rmSync(linkFaviconTestModeFile, { force: true });
rmSync(publicSiteUrlFile, { force: true });

const child = spawn(npmBin, ["run", "dev", "--", "--hostname", host, "--port", port], {
  cwd: process.cwd(),
  env: {
    ...process.env,
    API_KEY: process.env.API_KEY ?? "minakeep-playwright-api-key",
    DEMO_PASSWORD: process.env.DEMO_PASSWORD ?? "minakeep-demo-password",
    DEMO_USERNAME: process.env.DEMO_USERNAME ?? "demo",
    PLAYWRIGHT_AI_TEST_MODE_FILE: aiTestModeFile,
    PLAYWRIGHT_LINK_FAVICON_TEST_MODE_FILE: linkFaviconTestModeFile,
    PLAYWRIGHT_PUBLIC_SITE_URL_FILE: publicSiteUrlFile,
    PLAYWRIGHT_TEST: "1"
  }
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
