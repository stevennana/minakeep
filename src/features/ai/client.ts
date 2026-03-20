import { normalizeTagNames } from "@/features/tags/normalize";
import { serverLogger } from "@/lib/logging/server-logger";

export type MinaChatMessage = {
  role: "system" | "user";
  content: string;
};

export type EnrichmentMetadata = {
  summary: string;
  tags: string[];
};

type RequiredAiEnv = "LLM_BASE" | "TOKEN" | "MODEL";

type MinaAiConfig = {
  baseUrl: string;
  token: string;
  model: string;
};

export type MinaAiConfigStatus =
  | {
      state: "configured";
      config: MinaAiConfig;
    }
  | {
      state: "disabled";
    }
  | {
      state: "invalid";
      missing: RequiredAiEnv[];
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
    readonly code: "disabled" | "invalid-config" | "bad-response" | "invalid-response",
    message: string
  ) {
    super(message);
    this.name = "MinaAiClientError";
  }
}

function readOptionalEnv(name: RequiredAiEnv) {
  const value = process.env[name]?.trim();

  return value ? value : null;
}

function normalizeBaseUrl(baseUrl: string) {
  return baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
}

function getMissingConfig(baseUrl: string | null, token: string | null, model: string | null) {
  const missing: RequiredAiEnv[] = [];

  if (!baseUrl) {
    missing.push("LLM_BASE");
  }

  if (!token) {
    missing.push("TOKEN");
  }

  if (!model) {
    missing.push("MODEL");
  }

  return missing;
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

export function getMinaAiConfigStatus(): MinaAiConfigStatus {
  const baseUrl = readOptionalEnv("LLM_BASE");
  const token = readOptionalEnv("TOKEN");
  const model = readOptionalEnv("MODEL");
  const missing = getMissingConfig(baseUrl, token, model);

  if (missing.length === 3) {
    return {
      state: "disabled"
    };
  }

  if (missing.length > 0) {
    return {
      state: "invalid",
      missing
    };
  }

  return {
    state: "configured",
    config: {
      baseUrl: baseUrl ?? "",
      token: token ?? "",
      model: model ?? ""
    }
  };
}

export function buildMinaChatCompletionsRequest(messages: MinaChatMessage[]) {
  const configStatus = getMinaAiConfigStatus();

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

  let parsed: unknown;

  try {
    parsed = JSON.parse(rawContent);
  } catch {
    throw new MinaAiClientError("invalid-response", "The Mina AI endpoint returned non-JSON enrichment content.");
  }

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
  const request = buildMinaChatCompletionsRequest(messages);
  const response = await fetch(request.endpoint, request.init);

  if (!response.ok) {
    serverLogger.warn("Mina AI request failed.", {
      status: response.status,
      statusText: response.statusText
    });
    throw new MinaAiClientError("bad-response", `The Mina AI endpoint returned HTTP ${response.status}.`);
  }

  return normalizeMinaEnrichmentResponse(await response.json());
}
