import test from "node:test";
import assert from "node:assert/strict";

import { buildNoteEnrichmentMessages, executeNoteEnrichment } from "../../src/features/notes/enrichment";

test("buildNoteEnrichmentMessages includes the note title and markdown for the AI prompt", () => {
  const messages = buildNoteEnrichmentMessages({
    title: "Prompted note",
    markdown: "# Heading\n\nBody copy."
  });

  assert.equal(messages[0]?.role, "system");
  assert.match(messages[0]?.content ?? "", /Return JSON only/);
  assert.equal(messages[1]?.role, "user");
  assert.match(messages[1]?.content ?? "", /Title: Prompted note/);
  assert.match(messages[1]?.content ?? "", /# Heading/);
});

test("executeNoteEnrichment records generated summary and tags on success", async () => {
  const calls: Array<{ type: string; data?: unknown }> = [];

  const result = await executeNoteEnrichment(
    {
      findSourceById: async () => ({
        id: "note-1",
        title: "Queued note",
        markdown: "Body",
        enrichment: {
          status: "pending",
          attempts: 2
        }
      }),
      requestMetadata: async () => ({
        summary: "Generated summary",
        tags: ["docs", "ops"]
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
    "note-1",
    2
  );

  assert.equal(result, "ready");
  assert.deepEqual(calls, [
    {
      type: "success",
      data: {
        attempt: 2,
        summary: "Generated summary",
        tags: ["docs", "ops"]
      }
    }
  ]);
});

test("executeNoteEnrichment records a normalized failed state when the request throws", async () => {
  const calls: Array<{ type: string; error?: string }> = [];

  const result = await executeNoteEnrichment(
    {
      findSourceById: async () => ({
        id: "note-2",
        title: "Queued note",
        markdown: "Body",
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
    "note-2",
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

test("executeNoteEnrichment skips stale attempts", async () => {
  let requestCalled = false;

  const result = await executeNoteEnrichment(
    {
      findSourceById: async () => ({
        id: "note-3",
        title: "Queued note",
        markdown: "Body",
        enrichment: {
          status: "pending",
          attempts: 3
        }
      }),
      requestMetadata: async () => {
        requestCalled = true;
        return {
          summary: "Generated summary",
          tags: ["docs"]
        };
      },
      recordSuccess: async () => true,
      recordFailure: async () => true
    },
    "note-3",
    2
  );

  assert.equal(result, "skipped");
  assert.equal(requestCalled, false);
});
