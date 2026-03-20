import test from "node:test";
import assert from "node:assert/strict";

import { buildLinkEnrichmentMessages, executeLinkEnrichment } from "../../src/features/links/enrichment";

test("buildLinkEnrichmentMessages includes the link title and URL for the AI prompt", () => {
  const messages = buildLinkEnrichmentMessages({
    title: "Prompted link",
    url: "https://example.com/reference"
  });

  assert.equal(messages[0]?.role, "system");
  assert.match(messages[0]?.content ?? "", /Use only the provided title and URL/);
  assert.equal(messages[1]?.role, "user");
  assert.match(messages[1]?.content ?? "", /Title: Prompted link/);
  assert.match(messages[1]?.content ?? "", /URL: https:\/\/example.com\/reference/);
});

test("executeLinkEnrichment records generated summary and tags on success", async () => {
  const calls: Array<{ type: string; data?: unknown }> = [];

  const result = await executeLinkEnrichment(
    {
      findSourceById: async () => ({
        id: "link-1",
        title: "Queued link",
        url: "https://example.com/queued-link",
        enrichment: {
          status: "pending",
          attempts: 2
        }
      }),
      requestMetadata: async () => ({
        summary: "Generated summary",
        tags: ["reference", "queued"]
      }),
      recordSuccess: async (_id, attempt, data) => {
        calls.push({
          type: "success",
          data: {
            attempt,
            ...data
          }
        });
        return true;
      },
      recordFailure: async () => {
        calls.push({
          type: "failure"
        });
        return true;
      }
    },
    "link-1",
    2
  );

  assert.equal(result, "ready");
  assert.deepEqual(calls, [
    {
      type: "success",
      data: {
        attempt: 2,
        summary: "Generated summary",
        tags: ["reference", "queued"]
      }
    }
  ]);
});

test("executeLinkEnrichment records a normalized failed state when the request throws", async () => {
  const calls: Array<{ type: string; error?: string }> = [];

  const result = await executeLinkEnrichment(
    {
      findSourceById: async () => ({
        id: "link-2",
        title: "Queued link",
        url: "https://example.com/queued-link",
        enrichment: {
          status: "pending",
          attempts: 1
        }
      }),
      requestMetadata: async () => {
        throw new Error(" Remote timeout ");
      },
      recordSuccess: async () => true,
      recordFailure: async (_id, _attempt, error) => {
        calls.push({
          type: "failure",
          error
        });
        return true;
      }
    },
    "link-2",
    1
  );

  assert.equal(result, "failed");
  assert.deepEqual(calls, [
    {
      type: "failure",
      error: "Remote timeout"
    }
  ]);
});

test("executeLinkEnrichment skips stale attempts", async () => {
  let requestCalled = false;

  const result = await executeLinkEnrichment(
    {
      findSourceById: async () => ({
        id: "link-3",
        title: "Queued link",
        url: "https://example.com/queued-link",
        enrichment: {
          status: "pending",
          attempts: 3
        }
      }),
      requestMetadata: async () => {
        requestCalled = true;
        return {
          summary: "Generated summary",
          tags: ["reference"]
        };
      },
      recordSuccess: async () => true,
      recordFailure: async () => true
    },
    "link-3",
    2
  );

  assert.equal(result, "skipped");
  assert.equal(requestCalled, false);
});
