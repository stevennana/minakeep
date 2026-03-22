import "server-only";

import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { env } from "@/lib/config/env";
import { prisma } from "@/lib/prisma";
import type { WorkspaceRole } from "./roles";

export async function getOwnerSession() {
  const session = await getWorkspaceSession();

  if (!session || session.actor.role !== "owner") {
    return null;
  }

  return {
    id: session.owner.id,
    name: session.owner.name,
    role: session.actor.role
  };
}

export async function getWorkspaceSession() {
  const session = await auth();

  if (!session?.user?.id || !session.user.role) {
    return null;
  }

  const ownerLookup = session.user.role === "owner" ? { id: session.user.id } : { username: env.ownerUsername };
  const owner = await prisma.user.findUnique({
    where: {
      ...ownerLookup
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
    actor: {
      id: session.user.id,
      name: session.user.name ?? owner.username,
      role: session.user.role as WorkspaceRole
    },
    owner: {
      id: owner.id,
      name: owner.username
    }
  };
}

export async function requireOwnerSession() {
  const session = await getOwnerSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}

export async function requireWorkspaceSession() {
  const session = await getWorkspaceSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}
