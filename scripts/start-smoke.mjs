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

async function fetchRequiredText(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Smoke probe failed for ${url} with status ${response.status}`);
  }

  return response.text();
}

function expectIncludes(text, expected, context) {
  if (!text.includes(expected)) {
    throw new Error(`Expected ${context} to include "${expected}".`);
  }
}

function expectExcludes(text, unexpected, context) {
  if (text.includes(unexpected)) {
    throw new Error(`Expected ${context} to exclude "${unexpected}".`);
  }
}

function expectCanonical(html, expectedHref, context) {
  const canonicalMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i);

  if (expectedHref === null) {
    if (canonicalMatch) {
      throw new Error(`Expected ${context} to omit a canonical link, but found "${canonicalMatch[1]}".`);
    }

    return;
  }

  if (!canonicalMatch) {
    throw new Error(`Expected ${context} to include canonical href "${expectedHref}".`);
  }

  if (canonicalMatch[1] !== expectedHref) {
    throw new Error(`Expected ${context} canonical href to be "${expectedHref}", received "${canonicalMatch[1]}".`);
  }
}

function expectRenderedLegacyNoteMath(html, context) {
  expectIncludes(html, "markdown-math-inline", context);
  expectIncludes(html, "markdown-math-block", context);
  expectIncludes(html, 'class="katex"', context);
  expectExcludes(html, "$$", context);
}

function extractLocs(xml) {
  return Array.from(xml.matchAll(/<loc>(.*?)<\/loc>/g), (match) => match[1] ?? "");
}

async function verifyDiscoveryFailsClosed(baseUrl) {
  const robotsText = await fetchRequiredText(`${baseUrl}/robots.txt`);
  expectIncludes(robotsText, "User-Agent: *", "robots.txt");
  expectIncludes(robotsText, "Disallow: /", "robots.txt");
  expectExcludes(robotsText, "Sitemap:", "robots.txt");

  const sitemapText = await fetchRequiredText(`${baseUrl}/sitemap.xml`);
  expectIncludes(sitemapText, "<urlset", "sitemap.xml");

  if (extractLocs(sitemapText).length !== 0) {
    throw new Error("Expected sitemap.xml to fail closed with no public URLs when SITE_URL is unset.");
  }

  expectCanonical(await fetchRequiredText(`${baseUrl}/`), null, "homepage");
  const publicNoteHtml = await fetchRequiredText(`${baseUrl}/notes/legacy-note`);
  expectCanonical(publicNoteHtml, null, "public note page");
  expectRenderedLegacyNoteMath(publicNoteHtml, "public note page");
}

async function verifyDiscoveryConfigured(baseUrl, canonicalOrigin) {
  const robotsText = await fetchRequiredText(`${baseUrl}/robots.txt`);
  expectIncludes(robotsText, "User-Agent: *", "robots.txt");
  expectIncludes(robotsText, "Allow: /", "robots.txt");
  expectIncludes(robotsText, `Sitemap: ${canonicalOrigin}/sitemap.xml`, "robots.txt");

  const sitemapText = await fetchRequiredText(`${baseUrl}/sitemap.xml`);
  const sitemapLocs = extractLocs(sitemapText).sort();
  const expectedLocs = [`${canonicalOrigin}/`, `${canonicalOrigin}/notes/legacy-note`].sort();

  if (JSON.stringify(sitemapLocs) !== JSON.stringify(expectedLocs)) {
    throw new Error(`Expected sitemap.xml URLs ${JSON.stringify(expectedLocs)}, received ${JSON.stringify(sitemapLocs)}.`);
  }

  expectExcludes(sitemapText, "https://example.com/legacy", "sitemap.xml");
  expectCanonical(await fetchRequiredText(`${baseUrl}/`), `${canonicalOrigin}/`, "homepage");
  const publicNoteHtml = await fetchRequiredText(`${baseUrl}/notes/legacy-note`);
  expectCanonical(publicNoteHtml, `${canonicalOrigin}/notes/legacy-note`, "public note page");
  expectRenderedLegacyNoteMath(publicNoteHtml, "public note page");
}

async function runSmokeScenario({ env = process.env, probePaths: scenarioProbePaths = [], verify } = {}) {
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
    const baseUrl = `http://${host}:${port}`;
    await waitForHealth(`${baseUrl}/api/health`);

    for (const probePath of scenarioProbePaths) {
      const normalizedPath = probePath.startsWith("/") ? probePath : `/${probePath}`;
      await verifyProbePath(`${baseUrl}${normalizedPath}`);
    }

    if (verify) {
      await verify(baseUrl);
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
const discoveryCanonicalOrigin = "https://discovery.example.test";
const legacyEnv = {
  ...process.env,
  AUTH_SECRET: process.env.AUTH_SECRET ?? "minakeep-smoke-upgrade-secret",
  AUTH_TRUST_HOST: process.env.AUTH_TRUST_HOST ?? "true",
  DATABASE_URL: `file:${legacyDatabasePath}`,
  MEDIA_ROOT: path.join(legacySmokeDirectory, "media"),
  OWNER_USERNAME: process.env.OWNER_USERNAME ?? "owner",
  OWNER_PASSWORD: process.env.OWNER_PASSWORD ?? "owner-password",
  SITE_URL: ""
};

createLegacyUpgradeFixture(legacyDatabasePath);

try {
  await runSmokeScenario({
    env: legacyEnv,
    probePaths: ["/", "/notes/legacy-note"],
    verify: verifyDiscoveryFailsClosed
  });

  await runSmokeScenario({
    env: {
      ...legacyEnv,
      SITE_URL: discoveryCanonicalOrigin
    },
    probePaths: ["/", "/notes/legacy-note"],
    verify: (baseUrl) => verifyDiscoveryConfigured(baseUrl, discoveryCanonicalOrigin)
  });

  const backupRoots = readdirSync(path.join(legacySmokeDirectory, "backups"));

  if (backupRoots.length !== 1 || !existsSync(path.join(legacySmokeDirectory, "backups", backupRoots[0], "minakeep.db"))) {
    throw new Error("Legacy upgrade smoke expected exactly one restore-ready SQLite backup after db:prepare.");
  }
} finally {
  rmSync(legacySmokeDirectory, { recursive: true, force: true });
}
