import "server-only";

import { Prisma } from "@prisma/client";

import { requestEnrichment, retryEnrichment } from "@/features/enrichment/service";
import { cacheLinkFavicon } from "@/features/links/favicon";
import { normalizeLinkInput } from "@/features/links/normalize";
import { linksRepo } from "@/features/links/repo";
import type { LinkDraftInput } from "@/features/links/types";
import { recordPublicHomepageChange } from "@/features/public-site/state";

export class DuplicateLinkUrlError extends Error {
  constructor() {
    super("duplicate-link-url");
    this.name = "DuplicateLinkUrlError";
  }
}

export class PublishedLinkDeleteForbiddenError extends Error {
  constructor() {
    super("published-link-delete-forbidden");
    this.name = "PublishedLinkDeleteForbiddenError";
  }
}

export async function listOwnerLinks(ownerId: string) {
  return linksRepo.listForOwner(ownerId);
}

export async function listPublishedLinks() {
  const links = await linksRepo.listPublished();

  return links.filter((link): link is typeof link & { publishedAt: Date } => link.publishedAt !== null);
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

export async function publishLink(ownerId: string, id: string) {
  const existingLink = await linksRepo.findByIdForOwner(ownerId, id);

  if (!existingLink) {
    return null;
  }

  if (existingLink.isPublished) {
    return existingLink;
  }

  const link = await linksRepo.updatePublication(id, true);
  await recordPublicHomepageChange();
  return link;
}

export async function unpublishLink(ownerId: string, id: string) {
  const existingLink = await linksRepo.findByIdForOwner(ownerId, id);

  if (!existingLink) {
    return null;
  }

  if (!existingLink.isPublished) {
    return existingLink;
  }

  const link = await linksRepo.updatePublication(id, false);
  await recordPublicHomepageChange();
  return link;
}

export async function deleteSavedLink(ownerId: string, id: string) {
  const existingLink = await linksRepo.findByIdForOwner(ownerId, id);

  if (!existingLink) {
    return null;
  }

  if (existingLink.isPublished) {
    throw new PublishedLinkDeleteForbiddenError();
  }

  return linksRepo.delete(id);
}

export async function retryLinkEnrichment(ownerId: string, id: string) {
  const link = await linksRepo.findByIdForOwner(ownerId, id);

  if (!link) {
    return null;
  }

  return retryEnrichment(linksRepo, id, link);
}

export async function startLinkEnrichment(id: string) {
  return requestEnrichment(linksRepo, id);
}

export async function refreshLinkFavicon(ownerId: string, id: string) {
  return linksRepo.findByIdForOwner(ownerId, id);
}

export async function startLinkFaviconRefresh(id: string) {
  return cacheLinkFavicon(id);
}
