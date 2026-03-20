import "server-only";

import { prisma } from "@/lib/prisma";

export const notesRepo = {
  async listForOwner(ownerId: string) {
    return prisma.note.findMany({
      where: {
        ownerId
      },
      orderBy: {
        updatedAt: "desc"
      },
      select: {
        id: true,
        title: true,
        excerpt: true,
        isPublished: true,
        createdAt: true,
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
      select: {
        id: true,
        title: true,
        slug: true,
        markdown: true,
        excerpt: true,
        isPublished: true,
        createdAt: true,
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
  async create(ownerId: string, data: { title: string; slug: string; markdown: string; excerpt: string }) {
    return prisma.note.create({
      data: {
        ownerId,
        title: data.title,
        slug: data.slug,
        markdown: data.markdown,
        excerpt: data.excerpt
      },
      select: {
        id: true,
        title: true,
        slug: true,
        markdown: true,
        excerpt: true,
        isPublished: true,
        createdAt: true,
        updatedAt: true
      }
    });
  },
  async update(id: string, data: { title: string; slug: string; markdown: string; excerpt: string }) {
    return prisma.note.update({
      where: {
        id
      },
      data: {
        title: data.title,
        slug: data.slug,
        markdown: data.markdown,
        excerpt: data.excerpt
      },
      select: {
        id: true,
        title: true,
        slug: true,
        markdown: true,
        excerpt: true,
        isPublished: true,
        createdAt: true,
        updatedAt: true
      }
    });
  }
};
