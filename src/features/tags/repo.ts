import "server-only";

import { prisma } from "@/lib/prisma";

export const tagsRepo = {
  async listForOwner(ownerId: string) {
    const tags = await prisma.tag.findMany({
      where: {
        OR: [
          {
            notes: {
              some: {
                ownerId
              }
            }
          },
          {
            links: {
              some: {
                ownerId
              }
            }
          }
        ]
      },
      orderBy: {
        name: "asc"
      },
      select: {
        id: true,
        name: true,
        notes: {
          where: {
            ownerId
          },
          select: {
            id: true
          }
        },
        links: {
          where: {
            ownerId
          },
          select: {
            id: true
          }
        }
      }
    });

    return tags.map((tag) => ({
      id: tag.id,
      name: tag.name,
      noteCount: tag.notes.length,
      linkCount: tag.links.length
    }));
  }
};
