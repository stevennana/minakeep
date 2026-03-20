import "server-only";

import { prisma } from "@/lib/prisma";

const linkTagSelect = {
  orderBy: {
    name: "asc" as const
  },
  select: {
    id: true,
    name: true
  }
};

const linkSummarySelect = {
  id: true,
  url: true,
  title: true,
  summary: true,
  createdAt: true,
  updatedAt: true,
  tags: linkTagSelect
};

export const linksRepo = {
  async listForOwner(ownerId: string) {
    return prisma.link.findMany({
      where: {
        ownerId
      },
      orderBy: {
        updatedAt: "desc"
      },
      select: linkSummarySelect
    });
  },
  async listForOwnerByTag(ownerId: string, tagName: string) {
    return prisma.link.findMany({
      where: {
        ownerId,
        tags: {
          some: {
            name: tagName
          }
        }
      },
      orderBy: {
        updatedAt: "desc"
      },
      select: linkSummarySelect
    });
  },
  async searchForOwner(ownerId: string, query: string) {
    return prisma.link.findMany({
      where: {
        ownerId,
        OR: [
          {
            title: {
              contains: query
            }
          },
          {
            url: {
              contains: query
            }
          },
          {
            tags: {
              some: {
                name: {
                  contains: query
                }
              }
            }
          }
        ]
      },
      orderBy: {
        updatedAt: "desc"
      },
      select: linkSummarySelect
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
      select: linkSummarySelect
    });
  }
};
