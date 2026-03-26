import "server-only";

import type { Prisma } from "@prisma/client";

import type { EnrichmentRecordFields } from "@/features/enrichment/types";
import { normalizeEnrichmentStatus, toEnrichmentState } from "@/features/enrichment/types";
import { getFirstEmbeddedMarkdownImage } from "@/features/notes/markdown";
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
  markdown: true,
  excerpt: true,
  summary: true,
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

const notePublishedSelect = {
  id: true,
  title: true,
  slug: true,
  markdown: true,
  excerpt: true,
  summary: true,
  publishedAt: true,
  updatedAt: true,
  tags: noteTagSelect
};

const notePublishedSummarySelect = {
  id: true,
  title: true,
  slug: true,
  markdown: true,
  excerpt: true,
  summary: true,
  publishedAt: true,
  updatedAt: true,
  tags: noteTagSelect
};

type NoteSummaryRow = Prisma.NoteGetPayload<{
  select: typeof noteSummarySelect;
}>;

type NoteEditorRow = Prisma.NoteGetPayload<{
  select: typeof noteEditorSelect;
}>;

type NotePublishedSummaryRow = Prisma.NoteGetPayload<{
  select: typeof notePublishedSummarySelect;
}>;

type NotePublishedRow = Prisma.NoteGetPayload<{
  select: typeof notePublishedSelect;
}>;

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

function mapNoteSummaryRecord(note: NoteSummaryRow) {
  const { markdown, ...rest } = note;

  return {
    ...mapNoteRecord(rest),
    cardImage: getFirstEmbeddedMarkdownImage(markdown)
  };
}

function mapNoteEditorRecord(note: NoteEditorRow) {
  return {
    ...mapNoteRecord(note),
    cardImage: getFirstEmbeddedMarkdownImage(note.markdown)
  };
}

function mapNotePublishedSummaryRecord(note: NotePublishedSummaryRow) {
  const { markdown, ...rest } = note;

  return {
    ...rest,
    cardImage: getFirstEmbeddedMarkdownImage(markdown)
  };
}

function mapNotePublishedRecord(note: NotePublishedRow) {
  return {
    ...note,
    cardImage: getFirstEmbeddedMarkdownImage(note.markdown)
  };
}

function buildPublishedNoteWhere(query?: string) {
  const normalizedQuery = query?.trim();

  if (!normalizedQuery) {
    return {
      isPublished: true
    };
  }

  return {
    isPublished: true,
    title: {
      contains: normalizedQuery
    }
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

    return notes.map(mapNoteSummaryRecord);
  },
  async listForOwnerPage(ownerId: string, take: number) {
    const notes = await prisma.note.findMany({
      where: {
        ownerId
      },
      orderBy: {
        updatedAt: "desc"
      },
      select: noteSummarySelect,
      take
    });

    return notes.map(mapNoteSummaryRecord);
  },
  async countForOwner(ownerId: string) {
    return prisma.note.count({
      where: {
        ownerId
      }
    });
  },
  async countPublishedForOwner(ownerId: string) {
    return prisma.note.count({
      where: {
        ownerId,
        isPublished: true
      }
    });
  },
  async countPendingForOwner(ownerId: string) {
    return prisma.note.count({
      where: {
        ownerId,
        enrichmentStatus: normalizeEnrichmentStatus("pending")
      }
    });
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

    return notes.map(mapNoteSummaryRecord);
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

    return notes.map(mapNoteSummaryRecord);
  },
  async listPublished() {
    const notes = await prisma.note.findMany({
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
      select: notePublishedSummarySelect
    });

    return notes.map(mapNotePublishedSummaryRecord);
  },
  async listPublishedPage(take: number, query?: string) {
    const notes = await prisma.note.findMany({
      where: buildPublishedNoteWhere(query),
      orderBy: [
        {
          publishedAt: "desc"
        },
        {
          updatedAt: "desc"
        }
      ],
      select: notePublishedSummarySelect,
      take
    });

    return notes.map(mapNotePublishedSummaryRecord);
  },
  async countPublished(query?: string) {
    return prisma.note.count({
      where: buildPublishedNoteWhere(query)
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

    return note ? mapNoteEditorRecord(note) : null;
  },
  async findPublishedBySlug(slug: string) {
    const note = await prisma.note.findFirst({
      where: {
        slug,
        isPublished: true
      },
      select: notePublishedSelect
    });

    return note ? mapNotePublishedRecord(note) : null;
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
  async create(ownerId: string, data: { title: string; slug: string; markdown: string; excerpt: string }) {
    const note = await prisma.note.create({
      data: {
        ownerId,
        title: data.title,
        slug: data.slug,
        markdown: data.markdown,
        excerpt: data.excerpt
      },
      select: noteEditorSelect
    });

    return mapNoteEditorRecord(note);
  },
  async update(id: string, data: { title: string; slug: string; markdown: string; excerpt: string }) {
    const note = await prisma.note.update({
      where: {
        id
      },
      data: {
        title: data.title,
        slug: data.slug,
        markdown: data.markdown,
        excerpt: data.excerpt
      },
      select: noteEditorSelect
    });

    return mapNoteEditorRecord(note);
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

    return mapNoteEditorRecord(note);
  },
  async delete(id: string) {
    const note = await prisma.note.delete({
      where: {
        id
      },
      select: noteEditorSelect
    });

    return mapNoteEditorRecord(note);
  },
  async setEnrichmentPending(id: string) {
    const note = await prisma.note.update({
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
      select: noteEditorSelect
    });

    return mapNoteEditorRecord(note);
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

    return mapNoteEditorRecord(note);
  },
  async setEnrichmentFailed(id: string, error: string) {
    const note = await prisma.note.update({
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
      select: noteEditorSelect
    });

    return mapNoteEditorRecord(note);
  },
  async findEnrichmentSourceById(id: string) {
    const note = await prisma.note.findUnique({
      where: {
        id
      },
      select: {
        id: true,
        title: true,
        markdown: true,
        enrichmentStatus: true,
        enrichmentAttempts: true
      }
    });

    if (!note) {
      return null;
    }

    return {
      id: note.id,
      title: note.title,
      markdown: note.markdown,
      enrichment: {
        status: normalizeEnrichmentStatus(note.enrichmentStatus),
        attempts: note.enrichmentAttempts
      }
    };
  },
  async recordGeneratedMetadata(id: string, expectedAttempt: number, data: { summary: string; tagNames: string[] }) {
    return prisma.$transaction(async (transaction) => {
      const note = await transaction.note.findUnique({
        where: {
          id
        },
        select: {
          enrichmentAttempts: true
        }
      });

      if (!note || note.enrichmentAttempts !== expectedAttempt) {
        return false;
      }

      await transaction.note.update({
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
      const note = await transaction.note.findUnique({
        where: {
          id
        },
        select: {
          enrichmentAttempts: true
        }
      });

      if (!note || note.enrichmentAttempts !== expectedAttempt) {
        return false;
      }

      await transaction.note.update({
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
