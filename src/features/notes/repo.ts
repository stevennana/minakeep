import "server-only";

import type { EnrichmentRecordFields } from "@/features/enrichment/types";
import { toEnrichmentState } from "@/features/enrichment/types";
import { prisma } from "@/lib/prisma";

const noteTagSelect = {
  orderBy: {
    name: "asc" as const
  },
  select: {
    id: true,
    name: true
  }
};

const noteSummarySelect = {
  id: true,
  title: true,
  excerpt: true,
  isPublished: true,
  enrichmentStatus: true,
  enrichmentError: true,
  enrichmentAttempts: true,
  enrichmentUpdatedAt: true,
  createdAt: true,
  updatedAt: true,
  tags: noteTagSelect
};

const noteEditorSelect = {
  ...noteSummarySelect,
  slug: true,
  markdown: true
};

function mapNoteRecord<TRecord extends EnrichmentRecordFields>(note: TRecord) {
  const { enrichmentStatus, enrichmentError, enrichmentAttempts, enrichmentUpdatedAt, ...rest } = note;

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

export const notesRepo = {
  async listForOwner(ownerId: string) {
    const notes = await prisma.note.findMany({
      where: {
        ownerId
      },
      orderBy: {
        updatedAt: "desc"
      },
      select: noteSummarySelect
    });

    return notes.map(mapNoteRecord);
  },
  async listForOwnerByTag(ownerId: string, tagName: string) {
    const notes = await prisma.note.findMany({
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
      select: noteSummarySelect
    });

    return notes.map(mapNoteRecord);
  },
  async searchForOwner(ownerId: string, query: string) {
    const notes = await prisma.note.findMany({
      where: {
        ownerId,
        OR: [
          {
            title: {
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
      select: noteSummarySelect
    });

    return notes.map(mapNoteRecord);
  },
  async listPublished() {
    return prisma.note.findMany({
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
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        publishedAt: true,
        updatedAt: true
      }
    });
  },
  async findByIdForOwner(ownerId: string, id: string) {
    const note = await prisma.note.findFirst({
      where: {
        id,
        ownerId
      },
      select: noteEditorSelect
    });

    return note ? mapNoteRecord(note) : null;
  },
  async findPublishedBySlug(slug: string) {
    return prisma.note.findFirst({
      where: {
        slug,
        isPublished: true
      },
      select: {
        id: true,
        title: true,
        slug: true,
        markdown: true,
        excerpt: true,
        publishedAt: true,
        updatedAt: true
      }
    });
  },
  async listSlugsForOwner(ownerId: string) {
    const notes = await prisma.note.findMany({
      where: {
        ownerId
      },
      select: {
        slug: true
      }
    });

    return notes.map((note) => note.slug);
  },
  async create(ownerId: string, data: { title: string; slug: string; markdown: string; excerpt: string; tagNames: string[] }) {
    const note = await prisma.note.create({
      data: {
        ownerId,
        title: data.title,
        slug: data.slug,
        markdown: data.markdown,
        excerpt: data.excerpt,
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
      select: noteEditorSelect
    });

    return mapNoteRecord(note);
  },
  async update(id: string, data: { title: string; slug: string; markdown: string; excerpt: string; tagNames: string[] }) {
    const note = await prisma.note.update({
      where: {
        id
      },
      data: {
        title: data.title,
        slug: data.slug,
        markdown: data.markdown,
        excerpt: data.excerpt,
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
      },
      select: noteEditorSelect
    });

    return mapNoteRecord(note);
  },
  async updatePublication(id: string, isPublished: boolean) {
    const note = await prisma.note.update({
      where: {
        id
      },
      data: {
        isPublished,
        publishedAt: isPublished ? new Date() : null
      },
      select: noteEditorSelect
    });

    return mapNoteRecord(note);
  },
  async setEnrichmentPending(id: string) {
    const note = await prisma.note.update({
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
      select: noteEditorSelect
    });

    return mapNoteRecord(note);
  },
  async setEnrichmentReady(id: string) {
    const note = await prisma.note.update({
      where: {
        id
      },
      data: {
        enrichmentStatus: "ready",
        enrichmentError: null,
        enrichmentUpdatedAt: new Date()
      },
      select: noteEditorSelect
    });

    return mapNoteRecord(note);
  },
  async setEnrichmentFailed(id: string, error: string) {
    const note = await prisma.note.update({
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
      select: noteEditorSelect
    });

    return mapNoteRecord(note);
  }
};
