import "server-only";

import { Prisma } from "@prisma/client";

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
    return await linksRepo.create(ownerId, normalizedInput);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new DuplicateLinkUrlError();
    }

    throw error;
  }
}
