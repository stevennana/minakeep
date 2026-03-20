import "server-only";

import type { EnrichmentMetadata, MinaChatMessage } from "@/features/ai/client";
import { requestMinaEnrichment } from "@/features/ai/client";
import { normalizeEnrichmentFailure } from "@/features/enrichment/service";
import type { EnrichmentState } from "@/features/enrichment/types";

type NoteEnrichmentSource = {
  id: string;
  title: string;
  markdown: string;
  enrichment: Pick<EnrichmentState, "status" | "attempts">;
};

type NoteEnrichmentDependencies = {
  findSourceById(id: string): Promise<NoteEnrichmentSource | null>;
  requestMetadata(messages: MinaChatMessage[]): Promise<EnrichmentMetadata>;
  recordSuccess(id: string, expectedAttempt: number, data: EnrichmentMetadata): Promise<boolean>;
  recordFailure(id: string, expectedAttempt: number, error: string): Promise<boolean>;
};

const noteEnrichmentSystemPrompt =
  "You generate AI-owned metadata for one private markdown note. Return JSON only with keys `summary` and `tags`. " +
  "The summary must be 1-2 sentences, concise, factual, and under 240 characters. " +
  "The tags array must contain 2-6 short topic tags with no duplicates.";

export function buildNoteEnrichmentMessages(note: Pick<NoteEnrichmentSource, "title" | "markdown">): MinaChatMessage[] {
  return [
    {
      role: "system",
      content: noteEnrichmentSystemPrompt
    },
    {
      role: "user",
      content: [`Title: ${note.title}`, "Markdown:", note.markdown.trim() || "(empty note)"].join("\n\n")
    }
  ];
}

export async function executeNoteEnrichment(
  dependencies: NoteEnrichmentDependencies,
  id: string,
  expectedAttempt: number
) {
  const note = await dependencies.findSourceById(id);

  if (!note || note.enrichment.status !== "pending" || note.enrichment.attempts !== expectedAttempt) {
    return "skipped";
  }

  try {
    const metadata = await dependencies.requestMetadata(buildNoteEnrichmentMessages(note));
    await dependencies.recordSuccess(id, expectedAttempt, metadata);

    return "ready";
  } catch (error) {
    await dependencies.recordFailure(id, expectedAttempt, normalizeEnrichmentFailure(error));

    return "failed";
  }
}

export async function runNoteEnrichment(id: string, expectedAttempt: number) {
  const { notesRepo } = await import("@/features/notes/repo");

  return executeNoteEnrichment(
    {
      findSourceById: notesRepo.findEnrichmentSourceById,
      requestMetadata: requestMinaEnrichment,
      recordSuccess: (noteId, attempt, data) =>
        notesRepo.recordGeneratedMetadata(noteId, attempt, {
          summary: data.summary,
          tagNames: data.tags
        }),
      recordFailure: notesRepo.recordGeneratedFailure
    },
    id,
    expectedAttempt
  );
}
