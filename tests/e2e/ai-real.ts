import "dotenv/config";

export const AI_REAL_TEST_TAG = "@ai-real";
export const AI_REAL_ENV_MESSAGE = "Requires LLM_BASE, TOKEN, and MODEL.";

export function hasAiRealEnv() {
  return Boolean(process.env.LLM_BASE?.trim() && process.env.TOKEN?.trim() && process.env.MODEL?.trim());
}
