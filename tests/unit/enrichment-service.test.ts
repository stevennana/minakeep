import test from "node:test";
import assert from "node:assert/strict";

import { requestEnrichment } from "../../src/features/enrichment/service";

function withAiEnv(values: Partial<Record<"LLM_BASE" | "TOKEN" | "MODEL", string | undefined>>, callback: () => Promise<void>) {
  const original = {
    LLM_BASE: process.env.LLM_BASE,
    TOKEN: process.env.TOKEN,
    MODEL: process.env.MODEL
  };

  if (values.LLM_BASE === undefined) {
    delete process.env.LLM_BASE;
  } else {
    process.env.LLM_BASE = values.LLM_BASE;
  }

  if (values.TOKEN === undefined) {
    delete process.env.TOKEN;
  } else {
    process.env.TOKEN = values.TOKEN;
  }

  if (values.MODEL === undefined) {
    delete process.env.MODEL;
  } else {
    process.env.MODEL = values.MODEL;
  }

  return callback().finally(() => {
    if (original.LLM_BASE === undefined) {
      delete process.env.LLM_BASE;
    } else {
      process.env.LLM_BASE = original.LLM_BASE;
    }

    if (original.TOKEN === undefined) {
      delete process.env.TOKEN;
    } else {
      process.env.TOKEN = original.TOKEN;
    }

    if (original.MODEL === undefined) {
      delete process.env.MODEL;
    } else {
      process.env.MODEL = original.MODEL;
    }
  });
}

test("requestEnrichment records a failed state when the AI env is not configured", async () => {
  const calls: string[] = [];

  await withAiEnv({ LLM_BASE: undefined, TOKEN: undefined, MODEL: undefined }, async () => {
    await requestEnrichment(
      {
        setEnrichmentPending: async () => {
          calls.push("pending");
          return "pending";
        },
        setEnrichmentReady: async () => "ready",
        setEnrichmentFailed: async (_id, error) => {
          calls.push(error);
          return "failed";
        }
      },
      "note-1"
    );
  });

  assert.deepEqual(calls, ["Set LLM_BASE, TOKEN, and MODEL before AI enrichment can run."]);
});

test("requestEnrichment records a pending state when the AI env is configured", async () => {
  const calls: string[] = [];

  await withAiEnv(
    {
      LLM_BASE: "https://mina.example/v1",
      TOKEN: "token",
      MODEL: "model"
    },
    async () => {
      await requestEnrichment(
        {
          setEnrichmentPending: async (id) => {
            calls.push(id);
            return "pending";
          },
          setEnrichmentReady: async () => "ready",
          setEnrichmentFailed: async (_id, error) => {
            calls.push(error);
            return "failed";
          }
        },
        "link-1"
      );
    }
  );

  assert.deepEqual(calls, ["link-1"]);
});
