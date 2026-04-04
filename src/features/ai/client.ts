import "server-only";

import { getPlaywrightAiTestMode, type PlaywrightAiTestMode } from "@/features/ai/test-mode";
import { normalizeTagNames } from "@/features/tags/normalize";
import { getMinaAiConfigStatus } from "@/features/ai/config";
import { serverLogger } from "@/lib/logging/server-logger";

export type MinaChatMessage = {
  role: "system" | "user";
  content: string;
};

export type EnrichmentMetadata = {
  summary: string;
  tags: string[];
};

type MinaChatCompletionsResponse = {
  choices?: Array<{
    message?: {
      content?: string | Array<{ text?: string }>;
    };
  }>;
};

export class MinaAiClientError extends Error {
  constructor(
    readonly code: "disabled" | "invalid-config" | "bad-response" | "invalid-response" | "timeout",
    message: string
  ) {
    super(message);
    this.name = "MinaAiClientError";
  }
}

export const DEFAULT_MINA_AI_TIMEOUT_MS = 15000;
const PLAYWRIGHT_REAL_AI_TIMEOUT_MS = 45000;

export function getMinaAiRequestTimeoutMs(playwrightAiMode: PlaywrightAiTestMode = getPlaywrightAiTestMode()) {
  if (playwrightAiMode === "timeout") {
    return 1500;
  }

  const rawValue = Number.parseInt(process.env.MINA_AI_TIMEOUT_MS ?? "", 10);

  if (Number.isFinite(rawValue) && rawValue > 0) {
    return rawValue;
  }

  if (playwrightAiMode === "passthrough" && process.env.PLAYWRIGHT_TEST === "1") {
    return PLAYWRIGHT_REAL_AI_TIMEOUT_MS;
  }

  return DEFAULT_MINA_AI_TIMEOUT_MS;
}

function normalizeBaseUrl(baseUrl: string) {
  return baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
}

function readMessageContent(content: MinaChatCompletionsResponse["choices"]) {
  const messageContent = content?.[0]?.message?.content;

  if (typeof messageContent === "string") {
    return messageContent;
  }

  if (Array.isArray(messageContent)) {
    return messageContent
      .map((part) => (typeof part.text === "string" ? part.text : ""))
      .join("")
      .trim();
  }

  return "";
}

function parseEmbeddedJson(rawContent: string) {
  const candidates = [rawContent.trim()];
  const fencedMatch = rawContent.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);

  if (fencedMatch?.[1]) {
    candidates.push(fencedMatch[1].trim());
  }

  const firstBrace = rawContent.indexOf("{");
  const lastBrace = rawContent.lastIndexOf("}");

  if (firstBrace >= 0 && lastBrace > firstBrace) {
    candidates.push(rawContent.slice(firstBrace, lastBrace + 1).trim());
  }

  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate);
    } catch {
      continue;
    }
  }

  throw new MinaAiClientError("invalid-response", "The Mina AI endpoint returned non-JSON enrichment content.");
}

export function buildMinaChatCompletionsRequest(
  messages: MinaChatMessage[],
  configStatus = getMinaAiConfigStatus()
) {

  if (configStatus.state === "disabled") {
    throw new MinaAiClientError("disabled", "LLM_BASE, TOKEN, and MODEL must be set before AI enrichment can run.");
  }

  if (configStatus.state === "invalid") {
    throw new MinaAiClientError(
      "invalid-config",
      `AI enrichment configuration is incomplete. Missing: ${configStatus.missing.join(", ")}.`
    );
  }

  return {
    endpoint: new URL("chat/completions", normalizeBaseUrl(configStatus.config.baseUrl)).toString(),
    init: {
      method: "POST",
      headers: {
        Authorization: `Bearer ${configStatus.config.token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: configStatus.config.model,
        messages,
        response_format: {
          type: "json_object"
        }
      })
    }
  };
}

export function normalizeMinaEnrichmentResponse(payload: unknown): EnrichmentMetadata {
  const rawContent = readMessageContent((payload as MinaChatCompletionsResponse | null)?.choices);

  if (!rawContent) {
    throw new MinaAiClientError("bad-response", "The Mina AI endpoint returned no completion content.");
  }

  const parsed = parseEmbeddedJson(rawContent);

  const summary = typeof (parsed as { summary?: unknown }).summary === "string" ? (parsed as { summary: string }).summary.trim() : "";
  const rawTags = Array.isArray((parsed as { tags?: unknown }).tags) ? (parsed as { tags: unknown[] }).tags : null;

  if (!summary || !rawTags) {
    throw new MinaAiClientError("invalid-response", "The Mina AI endpoint omitted the normalized summary or tags fields.");
  }

  return {
    summary,
    tags: normalizeTagNames(
      rawTags
        .map((tag) => (typeof tag === "string" ? tag : ""))
        .filter(Boolean)
        .join(",")
    )
  };
}

export async function requestMinaEnrichment(messages: MinaChatMessage[]) {
  const playwrightAiMode = getPlaywrightAiTestMode();
  const request = buildMinaChatCompletionsRequest(messages, getMinaAiConfigStatus(playwrightAiMode));
  const timeoutMs = getMinaAiRequestTimeoutMs(playwrightAiMode);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort(new MinaAiClientError("timeout", "The Mina AI endpoint timed out."));
  }, timeoutMs);

  try {
    const response = await fetch(request.endpoint, {
      ...request.init,
      signal: controller.signal
    });

    if (!response.ok) {
      serverLogger.warn("Mina AI request failed.", {
        status: response.status,
        statusText: response.statusText
      });
      throw new MinaAiClientError("bad-response", `The Mina AI endpoint returned HTTP ${response.status}.`);
    }

    return normalizeMinaEnrichmentResponse(await response.json());
  } catch (error) {
    if (controller.signal.aborted) {
      throw controller.signal.reason instanceof MinaAiClientError
        ? controller.signal.reason
        : new MinaAiClientError("timeout", "The Mina AI endpoint timed out.");
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
