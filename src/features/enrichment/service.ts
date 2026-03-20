import "server-only";

import { type MinaAiConfigStatus, getMinaAiConfigStatus } from "@/features/ai/config";
import { MinaAiClientError } from "@/features/ai/client";
import type { EnrichmentState } from "@/features/enrichment/types";

type EnrichmentStateWriter<TRecord> = {
  setEnrichmentPending(id: string): Promise<TRecord>;
  setEnrichmentReady(id: string): Promise<TRecord>;
  setEnrichmentFailed(id: string, error: string): Promise<TRecord>;
};

function getConfigurationFailureMessage(configStatus: MinaAiConfigStatus) {
  if (configStatus.state === "disabled") {
    return "AI enrichment is disabled until LLM_BASE, TOKEN, and MODEL are set. Save succeeded without generated metadata.";
  }

  if (configStatus.state === "invalid") {
    return `AI enrichment is not fully configured. Missing: ${configStatus.missing.join(", ")}. Save succeeded without generated metadata.`;
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

export async function retryEnrichment<TRecord extends { enrichment: Pick<EnrichmentState, "status"> }>(
  writer: EnrichmentStateWriter<TRecord>,
  id: string,
  record: TRecord
) {
  if (record.enrichment.status !== "failed") {
    return record;
  }

  return requestEnrichment(writer, id);
}

export async function completeEnrichment<TRecord>(writer: EnrichmentStateWriter<TRecord>, id: string) {
  return writer.setEnrichmentReady(id);
}

export async function failEnrichment<TRecord>(writer: EnrichmentStateWriter<TRecord>, id: string, error: unknown) {
  return writer.setEnrichmentFailed(id, normalizeEnrichmentFailure(error));
}
