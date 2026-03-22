import "server-only";

import { redirect } from "next/navigation";

import { auth } from "@/auth";

export async function getOwnerSession() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  return {
    id: session.user.id,
    name: session.user.name ?? "owner"
  };
}

export async function requireOwnerSession() {
  const session = await getOwnerSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}
