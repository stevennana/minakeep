import "server-only";

import { prisma } from "@/lib/prisma";

export const linksRepo = {
  async listForOwner(ownerId: string) {
    return prisma.link.findMany({
      where: {
        ownerId
      },
      orderBy: {
        updatedAt: "desc"
      },
      select: {
        id: true,
        url: true,
        title: true,
        summary: true,
        createdAt: true,
        updatedAt: true,
        tags: {
          orderBy: {
            name: "asc"
          },
          select: {
            id: true,
            name: true
          }
        }
      }
    });
  },
  async create(ownerId: string, data: { url: string; title: string; summary: string; tagNames: string[] }) {
    return prisma.link.create({
      data: {
        ownerId,
        url: data.url,
        title: data.title,
        summary: data.summary,
        tags: {
          connectOrCreate: data.tagNames.map((name) => ({
            where: {
              name
            },
            create: {
              name
            }
          }))
        }
      },
      select: {
        id: true,
        url: true,
        title: true,
        summary: true,
        createdAt: true,
        updatedAt: true,
        tags: {
          orderBy: {
            name: "asc"
          },
          select: {
            id: true,
            name: true
          }
        }
      }
    });
  }
};
