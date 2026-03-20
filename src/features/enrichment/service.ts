import { type MinaAiConfigStatus, MinaAiClientError, getMinaAiConfigStatus } from "@/features/ai/client";

type EnrichmentStateWriter<TRecord> = {
  setEnrichmentPending(id: string): Promise<TRecord>;
  setEnrichmentReady(id: string): Promise<TRecord>;
  setEnrichmentFailed(id: string, error: string): Promise<TRecord>;
};

function getConfigurationFailureMessage(configStatus: MinaAiConfigStatus) {
  if (configStatus.state === "disabled") {
    return "Set LLM_BASE, TOKEN, and MODEL before AI enrichment can run.";
  }

  if (configStatus.state === "invalid") {
    return `Complete the AI enrichment configuration. Missing: ${configStatus.missing.join(", ")}.`;
  }

  return "AI enrichment failed.";
}

export function normalizeEnrichmentFailure(error: unknown) {
  if (error instanceof MinaAiClientError) {
    return error.message;
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message.trim().slice(0, 240);
  }

  return "AI enrichment failed.";
}

export async function requestEnrichment<TRecord>(writer: EnrichmentStateWriter<TRecord>, id: string) {
  const configStatus = getMinaAiConfigStatus();

  if (configStatus.state === "configured") {
    return writer.setEnrichmentPending(id);
  }

  return writer.setEnrichmentFailed(id, getConfigurationFailureMessage(configStatus));
}

export async function retryEnrichment<TRecord>(writer: EnrichmentStateWriter<TRecord>, id: string) {
  return requestEnrichment(writer, id);
}

export async function completeEnrichment<TRecord>(writer: EnrichmentStateWriter<TRecord>, id: string) {
  return writer.setEnrichmentReady(id);
}

export async function failEnrichment<TRecord>(writer: EnrichmentStateWriter<TRecord>, id: string, error: unknown) {
  return writer.setEnrichmentFailed(id, normalizeEnrichmentFailure(error));
}
