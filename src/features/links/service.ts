import "server-only";

import { Prisma } from "@prisma/client";

import { requestEnrichment, retryEnrichment } from "@/features/enrichment/service";
import { normalizeLinkInput } from "@/features/links/normalize";
import { linksRepo } from "@/features/links/repo";
import type { LinkDraftInput } from "@/features/links/types";

export class DuplicateLinkUrlError extends Error {
  constructor() {
    super("duplicate-link-url");
    this.name = "DuplicateLinkUrlError";
  }
}

export async function listOwnerLinks(ownerId: string) {
  return linksRepo.listForOwner(ownerId);
}

export async function createSavedLink(ownerId: string, input: LinkDraftInput) {
  const normalizedInput = normalizeLinkInput(input);

  try {
    const link = await linksRepo.create(ownerId, normalizedInput);

    await requestEnrichment(linksRepo, link.id);

    return link;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new DuplicateLinkUrlError();
    }

    throw error;
  }
}

export async function retryLinkEnrichment(ownerId: string, id: string) {
  const link = await linksRepo.findByIdForOwner(ownerId, id);

  if (!link) {
    return null;
  }

  return retryEnrichment(linksRepo, id);
}
