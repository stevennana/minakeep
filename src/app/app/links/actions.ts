"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { LinkValidationError } from "@/features/links/normalize";
import { DuplicateLinkUrlError, createSavedLink } from "@/features/links/service";
import { requireOwnerSession } from "@/lib/auth/owner-session";

function getLinkInput(formData: FormData) {
  return {
    url: String(formData.get("url") ?? ""),
    title: String(formData.get("title") ?? ""),
    summary: String(formData.get("summary") ?? ""),
    tags: String(formData.get("tags") ?? "")
  };
}

export async function createLinkAction(formData: FormData) {
  const owner = await requireOwnerSession();

  try {
    await createSavedLink(owner.id, getLinkInput(formData));
  } catch (error) {
    if (error instanceof LinkValidationError) {
      redirect(`/app/links?error=${error.code}`);
    }

    if (error instanceof DuplicateLinkUrlError) {
      redirect("/app/links?error=duplicate-url");
    }

    throw error;
  }

  revalidatePath("/app/links");
  redirect("/app/links?saved=1");
}
