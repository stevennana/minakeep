import type { LinkDraftInput } from "@/features/links/types";

export class LinkValidationError extends Error {
  constructor(readonly code: "invalid-url" | "missing-title" | "missing-summary") {
    super(code);
    this.name = "LinkValidationError";
  }
}

export function normalizeLinkUrl(url: string) {
  const trimmedUrl = url.trim();

  if (!trimmedUrl) {
    throw new LinkValidationError("invalid-url");
  }

  try {
    return new URL(trimmedUrl).toString();
  } catch {
    throw new LinkValidationError("invalid-url");
  }
}

export function normalizeTagNames(tags: string) {
  return Array.from(
    new Set(
      tags
        .split(/[\n,]/)
        .map((tag) => tag.trim().toLowerCase())
        .filter(Boolean)
    )
  ).sort((left, right) => left.localeCompare(right));
}

export function normalizeLinkInput(input: LinkDraftInput) {
  const title = input.title.trim();
  const summary = input.summary.trim();

  if (!title) {
    throw new LinkValidationError("missing-title");
  }

  if (!summary) {
    throw new LinkValidationError("missing-summary");
  }

  return {
    url: normalizeLinkUrl(input.url),
    title,
    summary,
    tagNames: normalizeTagNames(input.tags)
  };
}
