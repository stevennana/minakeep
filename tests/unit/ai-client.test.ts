import test from "node:test";
import assert from "node:assert/strict";

import {
  buildMinaChatCompletionsRequest,
  getMinaAiConfigStatus,
  normalizeMinaEnrichmentResponse
} from "../../src/features/ai/client";

function withAiEnv(values: Partial<Record<"LLM_BASE" | "TOKEN" | "MODEL", string | undefined>>, callback: () => void) {
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

  try {
    callback();
  } finally {
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
  }
}

test("getMinaAiConfigStatus returns disabled when no AI env vars are set", () => {
  withAiEnv({ LLM_BASE: undefined, TOKEN: undefined, MODEL: undefined }, () => {
    assert.deepEqual(getMinaAiConfigStatus(), {
      state: "disabled"
    });
  });
});

test("buildMinaChatCompletionsRequest shapes the Mina OpenAI-compatible request", () => {
  withAiEnv(
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
