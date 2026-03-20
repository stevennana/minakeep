import test from "node:test";
import assert from "node:assert/strict";

import { getMinaAiConfigStatus } from "../../src/features/ai/config";
import {
  DEFAULT_MINA_AI_TIMEOUT_MS,
  buildMinaChatCompletionsRequest,
  MinaAiClientError,
  getMinaAiRequestTimeoutMs,
  requestMinaEnrichment,
  normalizeMinaEnrichmentResponse
} from "../../src/features/ai/client";

function withAiEnv(
  values: Partial<Record<"LLM_BASE" | "TOKEN" | "MODEL" | "MINA_AI_TIMEOUT_MS", string | undefined>>,
  callback: () => void | Promise<void>
) {
  const original = {
    LLM_BASE: process.env.LLM_BASE,
    TOKEN: process.env.TOKEN,
    MODEL: process.env.MODEL,
    MINA_AI_TIMEOUT_MS: process.env.MINA_AI_TIMEOUT_MS
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

  if (values.MINA_AI_TIMEOUT_MS === undefined) {
    delete process.env.MINA_AI_TIMEOUT_MS;
  } else {
    process.env.MINA_AI_TIMEOUT_MS = values.MINA_AI_TIMEOUT_MS;
  }

  return Promise.resolve(callback()).finally(() => {
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

    if (original.MINA_AI_TIMEOUT_MS === undefined) {
      delete process.env.MINA_AI_TIMEOUT_MS;
    } else {
      process.env.MINA_AI_TIMEOUT_MS = original.MINA_AI_TIMEOUT_MS;
    }
  });
}

test("getMinaAiConfigStatus returns disabled when no AI env vars are set", async () => {
  await withAiEnv({ LLM_BASE: undefined, TOKEN: undefined, MODEL: undefined }, () => {
    assert.deepEqual(getMinaAiConfigStatus(), {
      state: "disabled"
    });
  });
});

test("buildMinaChatCompletionsRequest shapes the Mina OpenAI-compatible request", async () => {
  await withAiEnv(
    {
      LLM_BASE: "https://mina.example/v1",
      TOKEN: "test-token",
      MODEL: "mina-model"
    },
    () => {
      const request = buildMinaChatCompletionsRequest([
        {
          role: "system",
          content: "Return JSON."
        },
        {
          role: "user",
          content: "Summarize this note."
        }
      ]);

      assert.equal(request.endpoint, "https://mina.example/v1/chat/completions");
      assert.equal(request.init.method, "POST");
      assert.deepEqual(request.init.headers, {
        Authorization: "Bearer test-token",
        "Content-Type": "application/json"
      });
      assert.deepEqual(JSON.parse(request.init.body), {
        model: "mina-model",
        messages: [
          {
            role: "system",
            content: "Return JSON."
          },
          {
            role: "user",
            content: "Summarize this note."
          }
        ],
        response_format: {
          type: "json_object"
        }
      });
    }
  );
});

test("normalizeMinaEnrichmentResponse trims the summary and normalizes repeated tags", () => {
  const enrichment = normalizeMinaEnrichmentResponse({
    choices: [
      {
        message: {
          content: JSON.stringify({
            summary: " Helpful generated summary. ",
            tags: ["Docs", "docs", "Reference"]
          })
        }
      }
    ]
  });

  assert.deepEqual(enrichment, {
    summary: "Helpful generated summary.",
    tags: ["docs", "reference"]
  });
});

test("getMinaAiRequestTimeoutMs falls back to the default timeout", () => {
  const originalTimeout = process.env.MINA_AI_TIMEOUT_MS;
  delete process.env.MINA_AI_TIMEOUT_MS;

  try {
    assert.equal(getMinaAiRequestTimeoutMs(), DEFAULT_MINA_AI_TIMEOUT_MS);
  } finally {
    if (originalTimeout === undefined) {
      delete process.env.MINA_AI_TIMEOUT_MS;
    } else {
      process.env.MINA_AI_TIMEOUT_MS = originalTimeout;
    }
  }
});

test("requestMinaEnrichment aborts hung requests at the configured timeout", async () => {
  const originalFetch = global.fetch;

  global.fetch = ((_: string | URL | Request, init?: RequestInit) =>
    new Promise((_resolve, reject) => {
      init?.signal?.addEventListener("abort", () => {
        reject(init.signal?.reason ?? new Error("aborted"));
      });
    })) as typeof fetch;

  try {
    await withAiEnv(
      {
        LLM_BASE: "https://mina.example/v1",
        TOKEN: "test-token",
        MODEL: "mina-model",
        MINA_AI_TIMEOUT_MS: "20"
      },
      async () => {
        await assert.rejects(
          requestMinaEnrichment([
            {
              role: "user",
              content: "Summarize this note."
            }
          ]),
          (error: unknown) => {
            assert.ok(error instanceof MinaAiClientError);
            assert.equal(error.code, "timeout");
            assert.equal(error.message, "The Mina AI endpoint timed out.");
            return true;
          }
        );
      }
    );
  } finally {
    global.fetch = originalFetch;
  }
});
