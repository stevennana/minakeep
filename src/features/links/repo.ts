import "server-only";

import type { EnrichmentRecordFields } from "@/features/enrichment/types";
import { toEnrichmentState } from "@/features/enrichment/types";
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
  enrichmentStatus: true,
  enrichmentError: true,
  enrichmentAttempts: true,
  enrichmentUpdatedAt: true,
  createdAt: true,
  updatedAt: true,
  tags: linkTagSelect
};

function mapLinkRecord<TRecord extends EnrichmentRecordFields>(link: TRecord) {
  const { enrichmentStatus, enrichmentError, enrichmentAttempts, enrichmentUpdatedAt, ...rest } = link;

  return {
    ...rest,
    enrichment: toEnrichmentState({
      enrichmentStatus,
      enrichmentError,
      enrichmentAttempts,
      enrichmentUpdatedAt
    })
  };
}

export const linksRepo = {
  async listForOwner(ownerId: string) {
    const links = await prisma.link.findMany({
      where: {
        ownerId
      },
      orderBy: {
        updatedAt: "desc"
      },
      select: linkSummarySelect
    });

    return links.map(mapLinkRecord);
  },
  async listForOwnerByTag(ownerId: string, tagName: string) {
    const links = await prisma.link.findMany({
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

    return links.map(mapLinkRecord);
  },
  async findByIdForOwner(ownerId: string, id: string) {
    const link = await prisma.link.findFirst({
      where: {
        id,
        ownerId
      },
      select: linkSummarySelect
    });

    return link ? mapLinkRecord(link) : null;
  },
  async searchForOwner(ownerId: string, query: string) {
    const links = await prisma.link.findMany({
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

    return links.map(mapLinkRecord);
  },
  async create(ownerId: string, data: { url: string; title: string; summary: string; tagNames: string[] }) {
    const link = await prisma.link.create({
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

    return mapLinkRecord(link);
  },
  async setEnrichmentPending(id: string) {
    const link = await prisma.link.update({
      where: {
        id
      },
      data: {
        enrichmentStatus: "pending",
        enrichmentError: null,
        enrichmentAttempts: {
          increment: 1
        },
        enrichmentUpdatedAt: new Date()
      },
      select: linkSummarySelect
    });

    return mapLinkRecord(link);
  },
  async setEnrichmentReady(id: string) {
    const link = await prisma.link.update({
      where: {
        id
      },
      data: {
        enrichmentStatus: "ready",
        enrichmentError: null,
        enrichmentUpdatedAt: new Date()
      },
      select: linkSummarySelect
    });

    return mapLinkRecord(link);
  },
  async setEnrichmentFailed(id: string, error: string) {
    const link = await prisma.link.update({
      where: {
        id
      },
      data: {
        enrichmentStatus: "failed",
        enrichmentError: error,
        enrichmentAttempts: {
          increment: 1
        },
        enrichmentUpdatedAt: new Date()
      },
      select: linkSummarySelect
    });

    return mapLinkRecord(link);
  }
};
