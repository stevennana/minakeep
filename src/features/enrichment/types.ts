export const ENRICHMENT_STATUSES = ["pending", "ready", "failed"] as const;

export type EnrichmentStatus = (typeof ENRICHMENT_STATUSES)[number];

export type EnrichmentState = {
  status: EnrichmentStatus;
  error: string | null;
  attempts: number;
  updatedAt: Date | null;
};

export type EnrichmentRecordFields = {
  enrichmentStatus: string;
  enrichmentError: string | null;
  enrichmentAttempts: number;
  enrichmentUpdatedAt: Date | null;
};

export function normalizeEnrichmentStatus(status: string): EnrichmentStatus {
  if (ENRICHMENT_STATUSES.includes(status as EnrichmentStatus)) {
    return status as EnrichmentStatus;
  }

  return "failed";
}

export function toEnrichmentState(record: EnrichmentRecordFields): EnrichmentState {
  return {
    status: normalizeEnrichmentStatus(record.enrichmentStatus),
    error: record.enrichmentError,
    attempts: record.enrichmentAttempts,
    updatedAt: record.enrichmentUpdatedAt
  };
}

export function getEnrichmentStatusLabel(status: EnrichmentStatus) {
  switch (status) {
    case "pending":
      return "AI pending";
    case "ready":
      return "AI ready";
    case "failed":
      return "AI failed";
  }
}

export function getEnrichmentStatusDetail(state: EnrichmentState) {
  if (state.status === "failed") {
    return state.error ?? "AI enrichment failed.";
  }

  if (state.status === "ready") {
    return "Generated metadata is ready for later note and link surfaces.";
  }

  return "A save has queued enrichment for the configured Mina endpoint.";
}
