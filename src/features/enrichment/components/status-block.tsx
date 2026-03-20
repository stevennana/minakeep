import type { EnrichmentState } from "@/features/enrichment/types";
import {
  getEnrichmentAttemptLabel,
  getEnrichmentStatusDetail,
  getEnrichmentStatusLabel
} from "@/features/enrichment/types";

type EnrichmentStatusBlockProps = {
  state: EnrichmentState;
  detailClassName?: string;
};

export function EnrichmentStatusBlock({
  state,
  detailClassName = "field-note"
}: EnrichmentStatusBlockProps) {
  return (
    <div className="enrichment-status-block">
      <div className="note-meta note-meta-leading">
        <span>{getEnrichmentStatusLabel(state.status)}</span>
        <span>{getEnrichmentAttemptLabel(state.attempts)}</span>
      </div>
      <p className={detailClassName}>{getEnrichmentStatusDetail(state)}</p>
    </div>
  );
}
