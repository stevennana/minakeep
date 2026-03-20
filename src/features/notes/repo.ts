import "server-only";

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
  createdAt: true,
  updatedAt: true,
  tags: noteTagSelect
};

const noteEditorSelect = {
  ...noteSummarySelect,
  slug: true,
  markdown: true
};

export const notesRepo = {
  async listForOwner(ownerId: string) {
    return prisma.note.findMany({
      where: {
        ownerId
      },
      orderBy: {
        updatedAt: "desc"
      },
      select: noteSummarySelect
    });
  },
  async listForOwnerByTag(ownerId: string, tagName: string) {
    return prisma.note.findMany({
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
  },
  async searchForOwner(ownerId: string, query: string) {
    return prisma.note.findMany({
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
    return prisma.note.findFirst({
      where: {
        id,
        ownerId
      },
      select: noteEditorSelect
    });
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
    return prisma.note.create({
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
  },
  async update(id: string, data: { title: string; slug: string; markdown: string; excerpt: string; tagNames: string[] }) {
    return prisma.note.update({
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
  },
  async updatePublication(id: string, isPublished: boolean) {
    return prisma.note.update({
      where: {
        id
      },
      data: {
        isPublished,
        publishedAt: isPublished ? new Date() : null
      },
      select: noteEditorSelect
    });
  }
};
