import type { PrismaClient } from "@prisma/client";

type TestPrismaClient = Pick<PrismaClient, "link" | "note">;

export async function cleanupOwnerNoteFixtures(prisma: TestPrismaClient, ownerId: string, slugs: string[]) {
  await prisma.note.deleteMany({
    where: {
      ownerId,
      slug: {
        in: slugs
      }
    }
  });
}

export async function cleanupOwnerLinkFixtures(prisma: TestPrismaClient, ownerId: string, urls: string[]) {
  await prisma.link.deleteMany({
    where: {
      ownerId,
      url: {
        in: urls
      }
    }
  });
}
