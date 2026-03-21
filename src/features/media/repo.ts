import "server-only";

import { randomUUID } from "node:crypto";

import { prisma } from "@/lib/prisma";
import type { MediaAssetAccessRecord } from "@/features/media/types";

export const mediaRepo = {
  async findAccessRecordById(id: string): Promise<MediaAssetAccessRecord | null> {
    const asset = await prisma.mediaAsset.findUnique({
      where: {
        id
      },
      select: {
        id: true,
        ownerId: true,
        kind: true,
        storageKey: true,
        contentType: true,
        sizeBytes: true,
        note: {
          select: {
            isPublished: true,
            markdown: true
          }
        },
        link: {
          select: {
            isPublished: true
          }
        }
      }
    });

    if (!asset) {
      return null;
    }

    return {
      id: asset.id,
      ownerId: asset.ownerId,
      kind: asset.kind as MediaAssetAccessRecord["kind"],
      storageKey: asset.storageKey,
      contentType: asset.contentType,
      sizeBytes: asset.sizeBytes,
      note: asset.note,
      link: asset.link
    };
  },
  async createNoteImageAsset(data: {
    id: string;
    ownerId: string;
    noteId: string | null;
    storageKey: string;
    fileName: string;
    contentType: string;
    sizeBytes: number;
  }) {
    return prisma.mediaAsset.create({
      data: {
        id: data.id,
        ownerId: data.ownerId,
        noteId: data.noteId,
        kind: "note-image",
        storageKey: data.storageKey,
        fileName: data.fileName,
        contentType: data.contentType,
        sizeBytes: data.sizeBytes
      },
      select: {
        id: true
      }
    });
  },
  async attachOwnerNoteImagesToNote(ownerId: string, noteId: string, assetIds: string[]) {
    if (assetIds.length === 0) {
      return {
        count: 0
      };
    }

    return prisma.mediaAsset.updateMany({
      where: {
        id: {
          in: assetIds
        },
        kind: "note-image",
        ownerId,
        OR: [
          {
            noteId: null
          },
          {
            noteId
          }
        ]
      },
      data: {
        noteId
      }
    });
  },
  async upsertLinkFaviconAsset(data: {
    ownerId: string;
    linkId: string;
    storageKey: string;
    fileName: string;
    contentType: string;
    sizeBytes: number;
  }) {
    return prisma.$transaction(async (transaction) => {
      const existingAssets = await transaction.mediaAsset.findMany({
        where: {
          kind: "link-favicon",
          linkId: data.linkId
        },
        orderBy: {
          createdAt: "asc"
        },
        select: {
          id: true
        }
      });

      const primaryAsset = existingAssets[0];
      const redundantAssetIds = existingAssets.slice(1).map((asset) => asset.id);

      if (redundantAssetIds.length > 0) {
        await transaction.mediaAsset.deleteMany({
          where: {
            id: {
              in: redundantAssetIds
            }
          }
        });
      }

      if (primaryAsset) {
        return transaction.mediaAsset.update({
          where: {
            id: primaryAsset.id
          },
          data: {
            contentType: data.contentType,
            fileName: data.fileName,
            kind: "link-favicon",
            linkId: data.linkId,
            ownerId: data.ownerId,
            sizeBytes: data.sizeBytes,
            storageKey: data.storageKey
          },
          select: {
            id: true
          }
        });
      }

      return transaction.mediaAsset.create({
        data: {
          id: randomUUID(),
          contentType: data.contentType,
          fileName: data.fileName,
          kind: "link-favicon",
          linkId: data.linkId,
          ownerId: data.ownerId,
          sizeBytes: data.sizeBytes,
          storageKey: data.storageKey
        },
        select: {
          id: true
        }
      });
    });
  }
};
