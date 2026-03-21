import "server-only";

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
  }
};
