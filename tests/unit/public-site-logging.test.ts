import assert from "node:assert/strict";
import test from "node:test";

import { logSeoRouteRequest } from "../../src/features/public-site/seo-logging";

function createHeaders(values: Record<string, string | null>) {
  return {
    get(name: string) {
      return values[name.toLowerCase()] ?? null;
    }
  };
}

function captureLogs(callback: () => void) {
  const originalLog = console.log;
  const messages: string[] = [];

  console.log = (message: string) => {
    messages.push(message);
  };

  try {
    callback();
  } finally {
    console.log = originalLog;
  }

  return messages;
}

function withLogLevel(level: string, callback: () => void) {
  const originalLevel = process.env.LOG_LEVEL;
  process.env.LOG_LEVEL = level;

  try {
    callback();
  } finally {
    if (originalLevel === undefined) {
      delete process.env.LOG_LEVEL;
    } else {
      process.env.LOG_LEVEL = originalLevel;
    }
  }
}

test("logSeoRouteRequest stays silent when the owner setting is disabled", () => {
  const messages = captureLogs(() =>
    logSeoRouteRequest({
      contentType: "text/plain; charset=utf-8",
      durationMs: 12,
      failClosed: false,
      headers: createHeaders({
        "user-agent": "Googlebot"
      }),
      path: "/robots.txt",
      seoDebugLoggingEnabled: false,
      siteUrlState: "configured",
      status: 200
    })
  );

  assert.deepEqual(messages, []);
});

test("logSeoRouteRequest logs crawler requests at info level", () => {
  const messages = captureLogs(() =>
    withLogLevel("info", () =>
      logSeoRouteRequest({
        contentType: "application/xml; charset=utf-8",
        durationMs: 20,
        failClosed: true,
        headers: createHeaders({
          host: "notes.example.com",
          "user-agent": "Googlebot/2.1",
          "x-forwarded-for": "203.0.113.10"
        }),
        path: "/sitemap.xml",
        seoDebugLoggingEnabled: true,
        sitemapEntryCount: 0,
        siteUrlState: "missing",
        status: 200
      })
    )
  );

  assert.equal(messages.length, 1);
  assert.match(messages[0] ?? "", /"message":"SEO route served\."/);
  assert.match(messages[0] ?? "", /"isGooglebot":true/);
  assert.match(messages[0] ?? "", /"path":"\/sitemap\.xml"/);
});

test("logSeoRouteRequest logs non-crawler requests only at debug level", () => {
  const infoMessages = captureLogs(() =>
    withLogLevel("info", () =>
      logSeoRouteRequest({
        contentType: "text/plain; charset=utf-8",
        durationMs: 8,
        failClosed: false,
        headers: createHeaders({
          "user-agent": "Mozilla/5.0"
        }),
        path: "/robots.txt",
        seoDebugLoggingEnabled: true,
        siteUrlState: "configured",
        status: 200
      })
    )
  );

  assert.deepEqual(infoMessages, []);

  const debugMessages = captureLogs(() =>
    withLogLevel("debug", () =>
      logSeoRouteRequest({
        contentType: "text/plain; charset=utf-8",
        durationMs: 8,
        failClosed: false,
        headers: createHeaders({
          "user-agent": "Mozilla/5.0"
        }),
        path: "/robots.txt",
        seoDebugLoggingEnabled: true,
        siteUrlState: "configured",
        status: 200
      })
    )
  );

  assert.equal(debugMessages.length, 1);
  assert.match(debugMessages[0] ?? "", /"level":"debug"/);
  assert.match(debugMessages[0] ?? "", /"isKnownCrawler":false/);
});
