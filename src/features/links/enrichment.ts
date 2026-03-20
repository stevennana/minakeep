import "server-only";

import type { EnrichmentMetadata, MinaChatMessage } from "@/features/ai/client";
import { requestMinaEnrichment } from "@/features/ai/client";
import { normalizeEnrichmentFailure } from "@/features/enrichment/service";
import type { EnrichmentState } from "@/features/enrichment/types";

type LinkEnrichmentSource = {
  id: string;
  url: string;
  title: string;
  enrichment: Pick<EnrichmentState, "status" | "attempts">;
};

type LinkEnrichmentDependencies = {
  findSourceById(id: string): Promise<LinkEnrichmentSource | null>;
  requestMetadata(messages: MinaChatMessage[]): Promise<EnrichmentMetadata>;
  recordSuccess(id: string, expectedAttempt: number, data: EnrichmentMetadata): Promise<boolean>;
  recordFailure(id: string, expectedAttempt: number, error: string): Promise<boolean>;
};

const linkEnrichmentSystemPrompt =
  "You generate AI-owned metadata for one private saved link. Return JSON only with keys `summary` and `tags`. " +
  "Use only the provided title and URL. Do not claim to have visited the page. " +
  "The summary must be 1-2 sentences, concise, factual, and under 240 characters. " +
  "The tags array must contain 2-6 short topic tags with no duplicates.";

export function buildLinkEnrichmentMessages(link: Pick<LinkEnrichmentSource, "title" | "url">): MinaChatMessage[] {
  return [
    {
      role: "system",
      content: linkEnrichmentSystemPrompt
    },
    {
      role: "user",
      content: [`Title: ${link.title}`, `URL: ${link.url}`].join("\n\n")
    }
  ];
}

export async function executeLinkEnrichment(
  dependencies: LinkEnrichmentDependencies,
  id: string,
  expectedAttempt: number
) {
  const link = await dependencies.findSourceById(id);

  if (!link || link.enrichment.status !== "pending" || link.enrichment.attempts !== expectedAttempt) {
    return "skipped";
  }

  try {
    const metadata = await dependencies.requestMetadata(buildLinkEnrichmentMessages(link));
    await dependencies.recordSuccess(id, expectedAttempt, metadata);

    return "ready";
  } catch (error) {
    await dependencies.recordFailure(id, expectedAttempt, normalizeEnrichmentFailure(error));

    return "failed";
  }
}

export async function runLinkEnrichment(id: string, expectedAttempt: number) {
  const { linksRepo } = await import("@/features/links/repo");

  return executeLinkEnrichment(
    {
      findSourceById: linksRepo.findEnrichmentSourceById,
      requestMetadata: requestMinaEnrichment,
      recordSuccess: (linkId, attempt, data) =>
        linksRepo.recordGeneratedMetadata(linkId, attempt, {
          summary: data.summary,
          tagNames: data.tags
        }),
      recordFailure: linksRepo.recordGeneratedFailure
    },
    id,
    expectedAttempt
  );
}
