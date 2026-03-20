import type { LinkDraftInput } from "@/features/links/types";
import { normalizeTagNames } from "@/features/tags/normalize";

const SAFE_LINK_PROTOCOLS = new Set(["http:", "https:"]);

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
    const parsedUrl = new URL(trimmedUrl);

    if (!SAFE_LINK_PROTOCOLS.has(parsedUrl.protocol)) {
      throw new LinkValidationError("invalid-url");
    }

    return parsedUrl.toString();
  } catch {
    throw new LinkValidationError("invalid-url");
  }
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
