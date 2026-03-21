import "server-only";

import { readFile } from "node:fs/promises";

import { mediaRepo } from "@/features/media/repo";
import { resolveMediaStoragePath } from "@/features/media/storage";
import { resolveMediaAssetAccess, type MediaAccessMode } from "@/features/media/types";

export type ReadableMediaAsset = {
  accessMode: MediaAccessMode;
  body: Uint8Array<ArrayBuffer>;
  contentType: string;
  sizeBytes: number;
};

export async function getReadableMediaAsset(assetId: string, viewerOwnerId: string | null): Promise<ReadableMediaAsset | null> {
  const asset = await mediaRepo.findAccessRecordById(assetId);

  if (!asset) {
    return null;
  }

  const accessMode = resolveMediaAssetAccess(asset, viewerOwnerId);

  if (!accessMode) {
    return null;
  }

  try {
    const body = new Uint8Array(await readFile(resolveMediaStoragePath(asset.storageKey)));

    return {
      accessMode,
      body,
      contentType: asset.contentType,
      sizeBytes: asset.sizeBytes
    };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return null;
    }

    throw error;
  }
}
