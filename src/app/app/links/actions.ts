"use server";

import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { after } from "next/server";

import { getPlaywrightAiTestMode } from "@/features/ai/test-mode";
import { runLinkEnrichment } from "@/features/links/enrichment";
import { LinkValidationError } from "@/features/links/normalize";
import {
  DuplicateLinkUrlError,
  createSavedLink,
  deleteSavedLink,
  publishLink,
  PublishedLinkDeleteForbiddenError,
  refreshLinkFavicon,
  retryLinkEnrichment,
  startLinkFaviconRefresh,
  startLinkEnrichment,
  unpublishLink
} from "@/features/links/service";
import { getPlaywrightLinkFaviconTestMode } from "@/features/links/test-mode";
import { isReadOnlyWorkspaceMutationError, requireWritableOwnerSession } from "@/lib/auth/owner-session";

class DeleteConfirmationRequiredError extends Error {
  constructor() {
    super("delete-confirmation-required");
    this.name = "DeleteConfirmationRequiredError";
  }
}

function getLinkInput(formData: FormData) {
  return {
    url: String(formData.get("url") ?? ""),
    title: String(formData.get("title") ?? "")
  };
}

function requireDeleteConfirmation(formData: FormData) {
  if (String(formData.get("confirmDelete") ?? "") !== "permanent") {
    throw new DeleteConfirmationRequiredError();
  }
}

function revalidateLinkPaths() {
  revalidatePath("/");
  revalidatePath("/sitemap.xml");
  revalidatePath("/app/links");
  revalidatePath("/app/search");
  revalidatePath("/app/tags");
}

function scheduleLinkEnrichment(linkId: string, attempt: number) {
  if (getPlaywrightAiTestMode() !== "passthrough") {
    return runLinkEnrichment(linkId, attempt);
  }

  after(async () => {
    await runLinkEnrichment(linkId, attempt);
    revalidateLinkPaths();
  });
}

function scheduleLinkFaviconRefresh(linkId: string) {
  if (getPlaywrightLinkFaviconTestMode() !== "passthrough") {
    return startLinkFaviconRefresh(linkId);
  }

  after(async () => {
    await startLinkFaviconRefresh(linkId);
    revalidateLinkPaths();
  });
}

async function queueLinkEnrichment(linkId: string) {
  const link = await startLinkEnrichment(linkId);

  if (link.enrichment.status === "pending") {
    await scheduleLinkEnrichment(link.id, link.enrichment.attempts);
  }

  return link;
}

function appendReadOnlyError(path: string) {
  return `${path}${path.includes("?") ? "&" : "?"}error=read-only`;
}

async function withWritableOwnerSession<T>(redirectPath: string, run: (owner: Awaited<ReturnType<typeof requireWritableOwnerSession>>) => Promise<T>) {
  try {
    const owner = await requireWritableOwnerSession();
    return await run(owner);
  } catch (error) {
    if (isReadOnlyWorkspaceMutationError(error)) {
      redirect(appendReadOnlyError(redirectPath) as Parameters<typeof redirect>[0]);
    }

    throw error;
  }
}

export async function createLinkAction(formData: FormData) {
  try {
    const link = await withWritableOwnerSession("/app/links", (owner) => createSavedLink(owner.id, getLinkInput(formData)));
    await queueLinkEnrichment(link.id);
    scheduleLinkFaviconRefresh(link.id);
  } catch (error) {
    if (error instanceof LinkValidationError) {
      redirect(`/app/links?error=${error.code}`);
    }

    if (error instanceof DuplicateLinkUrlError) {
      redirect("/app/links?error=duplicate-url");
    }

    throw error;
  }

  revalidateLinkPaths();
  redirect("/app/links?saved=1");
}

export async function refreshLinkFaviconAction(linkId: string) {
  const link = await withWritableOwnerSession("/app/links", (owner) => refreshLinkFavicon(owner.id, linkId));

  if (!link) {
    notFound();
  }

  await startLinkFaviconRefresh(link.id);
  revalidateLinkPaths();
  redirect("/app/links?favicon=1");
}

export async function retryLinkEnrichmentAction(linkId: string) {
  const link = await withWritableOwnerSession("/app/links", (owner) => retryLinkEnrichment(owner.id, linkId));

  if (!link) {
    notFound();
  }

  if (link.enrichment.status === "pending") {
    await runLinkEnrichment(link.id, link.enrichment.attempts);
  }

  revalidateLinkPaths();
  redirect("/app/links?retried=1");
}

export async function publishLinkAction(linkId: string) {
  const link = await withWritableOwnerSession("/app/links", (owner) => publishLink(owner.id, linkId));

  if (!link) {
    notFound();
  }

  revalidateLinkPaths();
  redirect("/app/links?published=1");
}

export async function unpublishLinkAction(linkId: string) {
  const link = await withWritableOwnerSession("/app/links", (owner) => unpublishLink(owner.id, linkId));

  if (!link) {
    notFound();
  }

  revalidateLinkPaths();
  redirect("/app/links?unpublished=1");
}

export async function deleteLinkAction(linkId: string, formData: FormData) {
  try {
    requireDeleteConfirmation(formData);

    const link = await withWritableOwnerSession("/app/links", (owner) => deleteSavedLink(owner.id, linkId));

    if (!link) {
      notFound();
    }

    revalidateLinkPaths();
  } catch (error) {
    if (error instanceof DeleteConfirmationRequiredError) {
      redirect("/app/links?error=delete-confirmation");
    }

    if (error instanceof PublishedLinkDeleteForbiddenError) {
      redirect("/app/links?error=delete-published");
    }

    throw error;
  }

  redirect("/app/links?deleted=1");
}
