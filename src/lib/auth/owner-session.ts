import "server-only";

import { redirect } from "next/navigation";

import { auth } from "@/auth";

export async function requireOwnerSession() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  return {
    id: session.user.id,
    name: session.user.name ?? "owner"
  };
}
