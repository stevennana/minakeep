import "dotenv/config";

export const AI_REAL_TEST_TAG = "@ai-real";
export const AI_REAL_ENV_KEYS = ["LLM_BASE", "TOKEN", "MODEL"] as const;
export const AI_REAL_ENV_MESSAGE = `Requires ${AI_REAL_ENV_KEYS.join(", ")}.`;

export function getAiRealEnvStatus() {
  const missing = AI_REAL_ENV_KEYS.filter((name) => !process.env[name]?.trim());

  return {
    configured: missing.length === 0,
    missing
  };
}

export function hasAiRealEnv() {
  return getAiRealEnvStatus().configured;
}
