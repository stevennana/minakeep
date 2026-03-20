import "server-only";

export const MINA_AI_ENV_KEYS = ["LLM_BASE", "TOKEN", "MODEL"] as const;

export type RequiredAiEnv = (typeof MINA_AI_ENV_KEYS)[number];

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

function readOptionalEnv(name: RequiredAiEnv) {
  const value = process.env[name]?.trim();

  return value ? value : null;
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

export function getMinaAiConfigStatus(): MinaAiConfigStatus {
  const baseUrl = readOptionalEnv("LLM_BASE");
  const token = readOptionalEnv("TOKEN");
  const model = readOptionalEnv("MODEL");
  const missing = getMissingConfig(baseUrl, token, model);

  if (missing.length === MINA_AI_ENV_KEYS.length) {
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
