import "server-only";

import type { Prisma } from "@prisma/client";

import type { EnrichmentRecordFields } from "@/features/enrichment/types";
import { normalizeEnrichmentStatus, toEnrichmentState } from "@/features/enrichment/types";
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

const linkFaviconSelect = {
  where: {
    kind: "link-favicon"
  },
  orderBy: {
    updatedAt: "desc" as const
  },
  select: {
    id: true
  },
  take: 1
};

const linkSummarySelect = {
  id: true,
  url: true,
  title: true,
  summary: true,
  mediaAssets: linkFaviconSelect,
  isPublished: true,
  publishedAt: true,
  enrichmentStatus: true,
  enrichmentError: true,
  enrichmentAttempts: true,
  enrichmentUpdatedAt: true,
  createdAt: true,
  updatedAt: true,
  tags: linkTagSelect
};

const linkPublishedSelect = {
  id: true,
  url: true,
  title: true,
  summary: true,
  mediaAssets: linkFaviconSelect,
  publishedAt: true,
  updatedAt: true,
  tags: linkTagSelect
};

type LinkFaviconRecord = {
  mediaAssets: Array<{
    id: string;
  }>;
};

function getFaviconAssetId(link: LinkFaviconRecord) {
  return link.mediaAssets[0]?.id ?? null;
}

function mapLinkRecord<TRecord extends EnrichmentRecordFields & LinkFaviconRecord>(link: TRecord) {
  const { enrichmentStatus, enrichmentError, enrichmentAttempts, enrichmentUpdatedAt, mediaAssets, ...rest } = link;

  return {
    ...rest,
    faviconAssetId: getFaviconAssetId({ mediaAssets }),
    enrichment: toEnrichmentState({
      enrichmentStatus,
      enrichmentError,
      enrichmentAttempts,
      enrichmentUpdatedAt
    })
  };
}

function mapPublishedLinkRecord(link: {
  id: string;
  url: string;
  title: string;
  summary: string | null;
  publishedAt: Date | null;
  updatedAt: Date;
  tags: Array<{
    id: string;
    name: string;
  }>;
  mediaAssets: Array<{
    id: string;
  }>;
}) {
  if (!link.publishedAt) {
    throw new Error("Published links must include a publishedAt timestamp.");
  }

  return {
    ...link,
    faviconAssetId: getFaviconAssetId(link)
  };
}

function buildPublishedLinkWhere(query?: string): Prisma.LinkWhereInput {
  const normalizedQuery = query?.trim();
  const conditions: Prisma.LinkWhereInput[] = [
    {
      isPublished: true
    },
    {
      OR: [
        {
          url: {
            startsWith: "http://"
          }
        },
        {
          url: {
            startsWith: "https://"
          }
        }
      ]
    }
  ];

  if (normalizedQuery) {
    conditions.push({
      title: {
        contains: normalizedQuery
      }
    });
  }

  return {
    AND: conditions
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
  async listForOwnerPage(ownerId: string, take: number) {
    const links = await prisma.link.findMany({
      where: {
        ownerId
      },
      orderBy: {
        updatedAt: "desc"
      },
      select: linkSummarySelect,
      take
    });

    return links.map(mapLinkRecord);
  },
  async countForOwner(ownerId: string) {
    return prisma.link.count({
      where: {
        ownerId
      }
    });
  },
  async countPublishedForOwner(ownerId: string) {
    return prisma.link.count({
      where: {
        ownerId,
        isPublished: true
      }
    });
  },
  async countPendingForOwner(ownerId: string) {
    return prisma.link.count({
      where: {
        ownerId,
        enrichmentStatus: normalizeEnrichmentStatus("pending")
      }
    });
  },
  async listPublished() {
    const links = await prisma.link.findMany({
      where: {
        isPublished: true
      },
      orderBy: [
        {
          publishedAt: "desc"
        },
        {
          updatedAt: "desc"
        }
      ],
      select: linkPublishedSelect
    });

    return links.map(mapPublishedLinkRecord);
  },
  async listPublishedPage(take: number, query?: string) {
    const links = await prisma.link.findMany({
      where: buildPublishedLinkWhere(query),
      orderBy: [
        {
          publishedAt: "desc"
        },
        {
          updatedAt: "desc"
        }
      ],
      select: linkPublishedSelect,
      take
    });

    return links.map(mapPublishedLinkRecord);
  },
  async countPublished(query?: string) {
    return prisma.link.count({
      where: buildPublishedLinkWhere(query)
    });
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
  async create(ownerId: string, data: { url: string; title: string }) {
    const link = await prisma.link.create({
      data: {
        ownerId,
        url: data.url,
        title: data.title
      },
      select: linkSummarySelect
    });

    return mapLinkRecord(link);
  },
  async updatePublication(id: string, isPublished: boolean) {
    const link = await prisma.link.update({
      where: {
        id
      },
      data: {
        isPublished,
        publishedAt: isPublished ? new Date() : null
      },
      select: linkSummarySelect
    });

    return mapLinkRecord(link);
  },
  async delete(id: string) {
    const link = await prisma.link.delete({
      where: {
        id
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
        summary: null,
        enrichmentStatus: "pending",
        enrichmentError: null,
        enrichmentAttempts: {
          increment: 1
        },
        enrichmentUpdatedAt: new Date(),
        tags: {
          set: []
        }
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
        summary: null,
        enrichmentStatus: "failed",
        enrichmentError: error,
        enrichmentAttempts: {
          increment: 1
        },
        enrichmentUpdatedAt: new Date(),
        tags: {
          set: []
        }
      },
      select: linkSummarySelect
    });

    return mapLinkRecord(link);
  },
  async findEnrichmentSourceById(id: string) {
    const link = await prisma.link.findUnique({
      where: {
        id
      },
      select: {
        id: true,
        url: true,
        title: true,
        enrichmentStatus: true,
        enrichmentAttempts: true
      }
    });

    if (!link) {
      return null;
    }

    return {
      id: link.id,
      url: link.url,
      title: link.title,
      enrichment: {
        status: normalizeEnrichmentStatus(link.enrichmentStatus),
        attempts: link.enrichmentAttempts
      }
    };
  },
  async findFaviconSourceById(id: string) {
    return prisma.link.findUnique({
      where: {
        id
      },
      select: {
        id: true,
        ownerId: true,
        url: true
      }
    });
  },
  async recordGeneratedMetadata(id: string, expectedAttempt: number, data: { summary: string; tagNames: string[] }) {
    return prisma.$transaction(async (transaction) => {
      const link = await transaction.link.findUnique({
        where: {
          id
        },
        select: {
          enrichmentAttempts: true
        }
      });

      if (!link || link.enrichmentAttempts !== expectedAttempt) {
        return false;
      }

      await transaction.link.update({
        where: {
          id
        },
        data: {
          summary: data.summary,
          enrichmentStatus: "ready",
          enrichmentError: null,
          enrichmentUpdatedAt: new Date(),
          tags: {
            set: [],
            connectOrCreate: data.tagNames.map((name) => ({
              where: {
                name
              },
              create: {
                name
              }
            }))
          }
        }
      });

      return true;
    });
  },
  async recordGeneratedFailure(id: string, expectedAttempt: number, error: string) {
    return prisma.$transaction(async (transaction) => {
      const link = await transaction.link.findUnique({
        where: {
          id
        },
        select: {
          enrichmentAttempts: true
        }
      });

      if (!link || link.enrichmentAttempts !== expectedAttempt) {
        return false;
      }

      await transaction.link.update({
        where: {
          id
        },
        data: {
          summary: null,
          enrichmentStatus: "failed",
          enrichmentError: error,
          enrichmentUpdatedAt: new Date(),
          tags: {
            set: []
          }
        }
      });

      return true;
    });
  }
};
