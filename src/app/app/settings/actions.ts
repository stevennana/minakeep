"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { saveSiteSettings } from "@/features/site-settings/service";
import { isReadOnlyWorkspaceMutationError, requireWritableOwnerSession } from "@/lib/auth/owner-session";

function appendReadOnlyError(path: string) {
  return `${path}${path.includes("?") ? "&" : "?"}error=read-only`;
}

function revalidateSettingsPaths() {
  revalidatePath("/");
  revalidatePath("/login");
  revalidatePath("/app");
  revalidatePath("/app/links");
  revalidatePath("/app/search");
  revalidatePath("/app/tags");
  revalidatePath("/app/settings");
}

async function withWritableOwnerSession<T>(redirectPath: string, run: () => Promise<T>) {
  try {
    await requireWritableOwnerSession();
    return await run();
  } catch (error) {
    if (isReadOnlyWorkspaceMutationError(error)) {
      redirect(appendReadOnlyError(redirectPath) as Parameters<typeof redirect>[0]);
    }

    throw error;
  }
}

export async function saveSiteSettingsAction(formData: FormData) {
  await withWritableOwnerSession("/app/settings", () =>
    saveSiteSettings({
      title: String(formData.get("title") ?? ""),
      description: String(formData.get("description") ?? ""),
      seoDebugLoggingEnabled: formData.get("seoDebugLoggingEnabled") === "on"
    })
  );

  revalidateSettingsPaths();
  redirect("/app/settings?saved=1" as Parameters<typeof redirect>[0]);
}
