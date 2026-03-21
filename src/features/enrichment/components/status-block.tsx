import type { EnrichmentState } from "@/features/enrichment/types";
import {
  getEnrichmentAttemptLabel,
  getEnrichmentStatusDetail,
  getEnrichmentStatusLabel
} from "@/features/enrichment/types";
import { MetadataRow } from "@/components/ui/primitives";

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
      <MetadataRow leading>
        <span>{getEnrichmentStatusLabel(state.status)}</span>
        <span>{getEnrichmentAttemptLabel(state.attempts)}</span>
      </MetadataRow>
      <p className={detailClassName}>{getEnrichmentStatusDetail(state)}</p>
    </div>
  );
}
