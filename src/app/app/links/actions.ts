"use server";

import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { after } from "next/server";

import { runLinkEnrichment } from "@/features/links/enrichment";
import { LinkValidationError } from "@/features/links/normalize";
import { DuplicateLinkUrlError, createSavedLink, retryLinkEnrichment, startLinkEnrichment } from "@/features/links/service";
import { requireOwnerSession } from "@/lib/auth/owner-session";

function getLinkInput(formData: FormData) {
  return {
    url: String(formData.get("url") ?? ""),
    title: String(formData.get("title") ?? "")
  };
}

function revalidateLinkPaths() {
  revalidatePath("/app/links");
  revalidatePath("/app/search");
  revalidatePath("/app/tags");
}

function scheduleLinkEnrichment(linkId: string, attempt: number) {
  after(async () => {
    await runLinkEnrichment(linkId, attempt);
    revalidateLinkPaths();
  });
}

async function queueLinkEnrichment(linkId: string) {
  const link = await startLinkEnrichment(linkId);

  if (link.enrichment.status === "pending") {
    scheduleLinkEnrichment(link.id, link.enrichment.attempts);
  }

  return link;
}

export async function createLinkAction(formData: FormData) {
  const owner = await requireOwnerSession();

  try {
    const link = await createSavedLink(owner.id, getLinkInput(formData));
    await queueLinkEnrichment(link.id);
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

export async function retryLinkEnrichmentAction(linkId: string) {
  const owner = await requireOwnerSession();
  const link = await retryLinkEnrichment(owner.id, linkId);

  if (!link) {
    notFound();
  }

  if (link.enrichment.status === "pending") {
    scheduleLinkEnrichment(link.id, link.enrichment.attempts);
  }

  revalidateLinkPaths();
  redirect("/app/links?retried=1");
}
