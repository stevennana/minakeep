import "server-only";

import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function getOwnerSession() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const owner = await prisma.user.findUnique({
    where: {
      id: session.user.id
    },
    select: {
      id: true,
      username: true
    }
  });

  if (!owner) {
    return null;
  }

  return {
    id: owner.id,
    name: owner.username
  };
}

export async function requireOwnerSession() {
  const session = await getOwnerSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}
